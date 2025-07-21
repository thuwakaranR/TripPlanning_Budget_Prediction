import joblib
import pandas as pd
import random
from xgboost import XGBRegressor

# Load encoders and model
le_location = joblib.load("assets/le_location.pkl")
le_package = joblib.load("assets/le_package.pkl")

model = XGBRegressor()
model.load_model("assets/xgboost_model.json")

# Load the dataset
def load_dataset() -> pd.DataFrame:
    df = pd.read_excel("assets/Trip_Dataset_VZero.xlsx")
    
    # Drop unused columns
    df = df.drop(columns=['Location_Features', 'Review_Count'])
    df.rename(columns={'Duration (Days)': 'Days'}, inplace=True)

    # Encode Travel Companion
    travel_companion_map = {'Solo': 0, 'Couple': 1, 'Family': 2, 'Friends': 3}
    df['Travel_Companion'] = df['Travel_Companion'].map(travel_companion_map)

    # Rating range column
    df['Rating_Range'] = df['Avg_Rating'].apply(lambda r: f"{int(r)}-{int(r)+1}")

    # Encode locations and package types
    df['Location_ID'] = le_location.transform(df['Location_ID'])
    df['Package_Type'] = le_package.transform(df['Package_Type'])

    # One-hot encode activities
    df_activities = df['Activities'].str.get_dummies(sep=', ')
    df = pd.concat([df.drop(columns=['Activities']), df_activities], axis=1)

    return df

# Match model features
def prepare_input_for_prediction(X_filtered: pd.DataFrame, model: XGBRegressor) -> pd.DataFrame:
    model_features = model.get_booster().feature_names
    for feature in model_features:
        if feature not in X_filtered.columns:
            X_filtered[feature] = 0
    return X_filtered[model_features]

# Main function to get prediction options
def predict_budget_multiple_options(
    locations: list,
    package: str,
    total_days: int,
    rating_range: str,
    travel_companion: str,
    max_options: int = 3
):
    df = load_dataset()

    travel_map = {'Solo': 0, 'Couple': 1, 'Family': 2, 'Friends': 3}
    travel_code = travel_map.get(travel_companion, -1)

    if travel_code == -1:
        return {"error": "Invalid travel companion. Must be one of: Solo, Couple, Family, Friends."}

    df = df[df['Travel_Companion'] == travel_code]
    min_rating, max_rating = map(float, rating_range.split('-'))

    package_id = le_package.transform([package])[0]

    # Identify activity columns
    exclude = ['Budget (LKR)', 'Package_ID', 'Accommodation', 'Food & Transport', 
               'Rating_Range', 'Location_ID', 'Package_Type', 'Days', 'Avg_Rating', 'Predicted_Budget']
    activity_columns = [col for col in df.columns if col not in exclude]

    location_packages = {}

    for loc in locations:
        try:
            loc_id = le_location.transform([loc])[0]
        except:
            continue

        matching = df[(df['Location_ID'] == loc_id) & 
                      (df['Package_Type'] == package_id) & 
                      (df['Days'] <= total_days) & 
                      (df['Avg_Rating'].between(min_rating, max_rating))]

        if matching.empty:
            continue

        X = matching.drop(columns=['Budget (LKR)', 'Package_ID', 'Accommodation', 
                                   'Food & Transport', 'Rating_Range'])
        X = prepare_input_for_prediction(X, model)

        matching = matching.copy()
        matching.loc[:, 'Predicted_Budget'] = model.predict(X).round(2)
        location_packages[loc] = matching

    if not location_packages:
        return {"error": "No matching packages found for given criteria."}

    all_combinations = []

    for _ in range(max_options):
        selected_packages = []
        total_budget = 0
        remaining_days = total_days

        days_per_loc = {loc: max(1, total_days // len(locations)) for loc in locations}
        extra = total_days - sum(days_per_loc.values())
        for loc in random.sample(locations, len(locations)):
            if extra > 0:
                days_per_loc[loc] += 1
                extra -= 1

        for loc in locations:
            if loc not in location_packages:
                continue

            samples = location_packages[loc].sample(n=min(5, len(location_packages[loc])))
            loc_selected = []
            loc_days_used = 0

            for _, pkg in samples.iterrows():
                if loc_days_used + pkg['Days'] > days_per_loc[loc]:
                    continue

                pkg = pkg.copy()
                pkg['Location'] = le_location.inverse_transform([pkg['Location_ID']])[0]
                pkg['Package_Type'] = ['Basic', 'Moderate', 'Premium'][pkg['Package_Type']]
                activities = [a for a in activity_columns if pkg.get(a) == 1]
                pkg['Activities'] = activities

                pkg = pkg.drop(columns=activity_columns + ['Location_ID'])
                loc_selected.append(pkg)

                loc_days_used += pkg['Days']
                total_budget += pkg['Predicted_Budget']

                if loc_days_used >= days_per_loc[loc]:
                    break

            selected_packages.extend(loc_selected)
            remaining_days -= loc_days_used

        if selected_packages:
            df_result = pd.DataFrame(selected_packages)
            df_result = df_result[[
                'Location', 'Package_ID', 'Package_Type', 'Days',
                'Accommodation', 'Food & Transport', 'Avg_Rating',
                'Activities', 'Predicted_Budget'
            ]]
            df_result['Predicted_Budget'] = df_result['Predicted_Budget'].apply(lambda x: f"{x:.2f}")
            total_days_used = df_result['Days'].sum()
            all_combinations.append({
                "plan": df_result.to_dict(orient="records"),
                "total_days": int(total_days_used),
                "total_budget": round(total_budget, 2),
                "travel_companion": travel_companion
            })

    return all_combinations
