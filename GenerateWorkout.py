import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel, cosine_similarity
import random
import numpy as np

class GenerateWorkout:
    # Load dataset and prepare similarity matrices (as in the original code)
    df = pd.read_csv("./Workout data/AugmentedExercises.csv")
    df["SecondaryMuscles"] = df["SecondaryMuscles"].fillna("").str.split(", ")

    # Categorical similarity matrix preparation (from original code)
    bodypart_dummies = pd.get_dummies(df["BodyPart"], prefix="BodyPart")
    movement_dummies = pd.get_dummies(df["Movement"], prefix="Movement")
    equipment_dummies = pd.get_dummies(df["Equipment"], prefix="Equipment")
    level_dummies = pd.get_dummies(df["Level"], prefix="Level")

    secondary_exp = df["SecondaryMuscles"].explode()
    secondary_dummies = pd.get_dummies(secondary_exp, prefix="Secondary").groupby(level=0).max()

    categorical_matrix = pd.concat([
        bodypart_dummies, movement_dummies, equipment_dummies,
        level_dummies, secondary_dummies], axis=1).fillna(0)
    categorical_sim = cosine_similarity(categorical_matrix)

    # Text similarity matrix (from original code)
    tfidf = TfidfVectorizer(stop_words="english")
    desc_matrix = tfidf.fit_transform(df["Desc"])
    text_sim = linear_kernel(desc_matrix, desc_matrix)
    combined_sim = 0.5 * categorical_sim + 0.5 * text_sim

    indices = pd.Series(df.index, index=df["Title"]).drop_duplicates()

    # Define primary exercises for each movement pattern
    primary_exercises = {
        "push": df[df["Movement"]=="push"].sort_values("Rating", ascending=False).head(15)["Title"].to_list(),
        "pull": df[df["Movement"]=="pull"].sort_values("Rating", ascending=False).head(15)["Title"].to_list(),
        "legs": df[df["Movement"]=="legs"].sort_values("Rating", ascending=False).head(15)["Title"].to_list(),
        "core": df[df["Movement"]=="core"].sort_values("Rating", ascending=False).head(15)["Title"].to_list()
    }
    
    def get_plan_details(goal):
        # Set parameters based on goal
        if goal == "Strength":
            reps = (1, 5)
            rest = "2-5 min"
            sets_per = 3
        elif goal == "Hypertrophy":
            reps = (8, 12)
            rest = "1-2 min"
            sets_per = 3
        elif goal == "Endurance":
            reps = (15, 40)
            rest = "30-60s"
            sets_per = 2
        
        return (reps, rest, sets_per)

    # Finds 10 similar exercises from a given exercise
    # Suggests a random one amongst them
    @classmethod
    def get_recommendations(cls, title, level="Beginner"):
        similarity_matrix = cls.combined_sim
        idx = cls.indices[title]

        if isinstance(idx, (pd.Series, pd.Index, list, np.ndarray)):
            idx = idx.iloc[0]
            
        sim_scores = list(enumerate(similarity_matrix[idx]))
        # Slightly higher suggested score if level is same as user
        sim_scores = [(i, score + 0.1 if cls.df.iloc[i]["Level"] == level else score) for i, score in sim_scores]
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        return cls.df.iloc[random.choice(sim_scores[:10])[0]]

    @classmethod
    def generate_first_week_plan(cls, days_per_week, goal, level):
        # Determine workout split
        if days_per_week == 3:
            split = ["Full-Body"] * 3
        elif days_per_week == 4:
            split = ["Upper", "Lower", "Upper", "Lower"]
        elif days_per_week == 5:
            split = ["Push", "Pull", "Legs", "Upper", "Lower"]
        elif days_per_week == 6:
            split = ["Push", "Pull", "Legs", "Push", "Pull", "Legs"]
        else:
            return "Invalid number of days (choose 3-6)."

        reps, rest, sets_per = cls.get_plan_details(goal)

        workout_plan = {}
        day_num = 1
        for day_type in split:
            exercises = []
            if day_type == "Full-Body":
                # Include 1 push, 1 pull, 1 legs, 1 core
                for movement in ["push", "pull", "legs", "core"]:
                    primary = random.choice(cls.primary_exercises[movement])
                    recs = cls.get_recommendations(primary, level)
                    exercise = recs["Title"]
                    exercises.append({
                        "Exercise": exercise,
                        "Sets": sets_per,
                        "Reps": f"{reps[0]}-{reps[1]}",
                        "Rest": rest
                    })
            elif day_type == "Upper":
                # 2 push, 2 pull
                for movement in ["push", "push", "pull", "pull"]:
                    primary = random.choice(cls.primary_exercises[movement])
                    recs = cls.get_recommendations(primary, level)
                    exercise = recs["Title"]
                    exercises.append({
                        "Exercise": exercise,
                        "Sets": sets_per,
                        "Reps": f"{reps[0]}-{reps[1]}",
                        "Rest": rest
                    })
            elif day_type == "Lower":
                # 2 legs, 2 core
                for movement in ["legs", "legs", "core", "core"]:
                    primary = random.choice(cls.primary_exercises[movement])
                    recs = cls.get_recommendations(primary, level)
                    exercise = recs["Title"]
                    exercises.append({
                        "Exercise": exercise,
                        "Sets": sets_per,
                        "Reps": f"{reps[0]}-{reps[1]}",
                        "Rest": rest
                    })
            elif day_type in ["Push", "Pull", "Legs"]:
                movement = day_type.lower()
                for _ in range(0, 4):  # 4 exercises per focused day
                    primary = random.choice(cls.primary_exercises[movement])
                    recs = cls.get_recommendations(primary, level)
                    exercise = recs["Title"]
                    exercises.append({
                        "Exercise": exercise,
                        "Sets": sets_per,
                        "Reps": f"{reps[0]}-{reps[1]}",
                        "Rest": rest
                    })
            
            workout_plan[f"Day {day_num} {day_type}"] = exercises
            day_num += 1
        
        return workout_plan

    # Gets exercise desciption from the dataset of exercises  
    @classmethod
    def get_ex_desc(cls, ex):
        return cls.df.loc[cls.df["Title"] == ex]["Desc"].values[0]
    
    @classmethod
    def generate_next_exercise(cls, title, rating, level, goal):
        reps, rest, sets_per = cls.get_plan_details(goal)

        if rating is None:
            cat_weight, text_weight = 0.5, 0.5

        # The algorithm generates a weighing system based on how much they liked an exercise
        # It is used to recommend future exercises
        if rating == 1:
            cat_weight, text_weight = 0.2, 0.8
        elif rating == 2:
            cat_weight, text_weight = 0.4, 0.6
        elif rating == 3:
            cat_weight, text_weight = 0.6, 0.4
        elif rating == 4:
            cat_weight, text_weight = 0.8, 0.2
        elif rating == 5:
            cat_weight, text_weight = 1, 0

        combined_sim = cat_weight * cls.categorical_sim + text_weight * cls.text_sim
        idx = cls.indices[title]

        if isinstance(idx, (pd.Series, pd.Index, list, np.ndarray)):
            idx = idx.iloc[0]
        sim_scores = list(enumerate(combined_sim[idx]))
        sim_scores = [(i, score + 0.1 if cls.df.iloc[i]["Level"] == level else score) for i, score in sim_scores]
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        recom_ex = cls.df.iloc[random.choice(sim_scores[:5])[0]]["Title"]
        return {
                "Exercise": recom_ex,
                "Sets": sets_per,
                "Reps": f"{reps[0]}-{reps[1]}",
                "Rest": rest
                }

    