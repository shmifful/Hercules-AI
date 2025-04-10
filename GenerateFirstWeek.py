import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel, cosine_similarity
import random

class GenerateWorkout:
    # Load dataset and prepare similarity matrices (as in the original code)
    df = pd.read_csv("./Workout data/AugmentedExercises.csv")
    df = df.sort_values("Rating")
    df['SecondaryMuscles'] = df['SecondaryMuscles'].fillna('').str.split(', ')

    # Categorical similarity matrix preparation (from original code)
    bodypart_dummies = pd.get_dummies(df['BodyPart'], prefix='BodyPart')
    movement_dummies = pd.get_dummies(df['Movement'], prefix='Movement')
    equipment_dummies = pd.get_dummies(df['Equipment'], prefix='Equipment')
    level_dummies = pd.get_dummies(df['Level'], prefix='Level')

    secondary_exp = df['SecondaryMuscles'].explode()
    secondary_dummies = pd.get_dummies(secondary_exp, prefix='Secondary').groupby(level=0).max()

    categorical_matrix = pd.concat([
        bodypart_dummies, movement_dummies, equipment_dummies,
        level_dummies, secondary_dummies], axis=1).fillna(0)
    categorical_sim = cosine_similarity(categorical_matrix)

    # Text similarity matrix (from original code)
    tfidf = TfidfVectorizer(stop_words='english')
    desc_matrix = tfidf.fit_transform(df['Desc'])
    text_sim = linear_kernel(desc_matrix, desc_matrix)
    combined_sim = 0.45 * categorical_sim + 0.55 * text_sim

    indices = pd.Series(df.index, index=df['Title']).drop_duplicates()

    # Define primary exercises for each movement pattern
    primary_exercises = {
        'push': df[df["Movement"]=="push"].head(10)["Title"].to_list(),
        'pull': df[df["Movement"]=="pull"].head(10)["Title"].to_list(),
        'legs': df[df["Movement"]=="legs"].head(10)["Title"].to_list(),
        'core': df[df["Movement"]=="core"].head(10)["Title"].to_list()
    }

    @classmethod
    def get_recommendations(cls, title, similarity_matrix=combined_sim, num_recommend=10):
        idx = cls.indices[title]
        sim_scores = list(enumerate(similarity_matrix[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        top_indices = [i[0] for i in random.sample(sim_scores[1:11], num_recommend)]
        return cls.df.iloc[top_indices]

    @classmethod
    def generate_workout_plan(cls, days_per_week, goal):
        # Determine workout split
        if days_per_week == 3:
            split = ['Full-Body'] * 3
        elif days_per_week == 4:
            split = ['Upper', 'Lower', 'Upper', 'Lower']
        elif days_per_week == 5:
            split = ['Push', 'Pull', 'Legs', 'Upper', 'Lower']
        elif days_per_week == 6:
            split = ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs']
        else:
            return "Invalid number of days (choose 3-6)."

        # Set parameters based on goal
        if goal == 'Strength':
            reps = (1, 5)
            rest = '2-5 min'
            sets_per = 3
        elif goal == 'Hypertrophy':
            reps = (8, 12)
            rest = '1-2 min'
            sets_per = 3
        elif goal == 'Endurance':
            reps = (15, 40)
            rest = '30-60s'
            sets_per = 2
        else:
            return "Invalid goal (choose: strength, hypertrophy, endurance)."

        workout_plan = {}
        for day_num, day_type in enumerate(split, 1):
            exercises = []
            if day_type == 'Full-Body':
                # Include 2 push, 2 pull, 1 legs, 1 core
                for movement in ['push', 'push', 'pull', 'pull', 'legs', 'core']:
                    primary = random.choice(cls.primary_exercises[movement])
                    recs = cls.get_recommendations(primary, num_recommend=5)
                    exercise = recs.iloc[0]['Title']
                    exercises.append({
                        'Exercise': exercise,
                        'Sets': sets_per,
                        'Reps': f"{reps[0]}-{reps[1]}",
                        'Rest': rest
                    })
            elif day_type == 'Upper':
                # 2 push, 2 pull, 2 core
                for movement in ['push', 'push', 'pull', 'pull', 'core', 'core']:
                    primary = random.choice(cls.primary_exercises[movement])
                    recs = cls.get_recommendations(primary, num_recommend=5)
                    exercise = recs.iloc[0]['Title']
                    exercises.append({
                        'Exercise': exercise,
                        'Sets': sets_per,
                        'Reps': f"{reps[0]}-{reps[1]}",
                        'Rest': rest
                    })
            elif day_type == 'Lower':
                # 3 legs, 2 core
                for movement in ['legs', 'legs', 'legs', 'core', 'core']:
                    primary = random.choice(cls.primary_exercises[movement])
                    recs = cls.get_recommendations(primary, num_recommend=5)
                    exercise = recs.iloc[0]['Title']
                    exercises.append({
                        'Exercise': exercise,
                        'Sets': sets_per,
                        'Reps': f"{reps[0]}-{reps[1]}",
                        'Rest': rest
                    })
                core_primary = cls.primary_exercises['core'][0]
                core_ex = cls.get_recommendations(core_primary).iloc[0]['Title']
                exercises.append({
                    'Exercise': core_ex,
                    'Sets': sets_per,
                    'Reps': f"{reps[0]}-{reps[1]}",
                    'Rest': rest
                })
            elif day_type in ['Push', 'Pull', 'Legs']:
                movement = day_type.lower()
                for _ in range(4):  # 4 exercises per focused day
                    primary = random.choice(cls.primary_exercises[movement])
                    recs = cls.get_recommendations(primary, num_recommend=2)
                    exercise = recs.iloc[0]['Title']
                    exercises.append({
                        'Exercise': exercise,
                        'Sets': sets_per,
                        'Reps': f"{reps[0]}-{reps[1]}",
                        'Rest': rest
                    })
            
            workout_plan[f'Day {day_num} ({day_type})'] = exercises
        
        return workout_plan
