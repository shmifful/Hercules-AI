# Hercules AI - personal AI fitness coach
## Description
Hercules AI is an Android app that suggests workouts based on the user's preferences (i.e. fitness goals, days to workout, fitness level) and uses the user's workout history to generate a workout plan using an unsupervised machine learning algorithm, Content-Based Filtering.

## App features
### Mobile app (client)
Welcome screen:
- Allows user to log in
- Allows user to register if they do not have an account

Main screen:
- Greets the user
- Shows users the days they have not yet worked out
- If the user has completed a workout, the day will be unavailable
- Every week, there will be a new workout for the user to complete based on what they have done previously

Settings screen:
- Shows user preferences and allows user to change them
- Allows user to log out

Day screen:
- Allows user to change workout fo the day
- Tells the user what exercises to follow
- If 1RM is 0, they user must enter their 1RM for their exercise before continuing

Workout screen:
- The app reminds the user to be careful before and when completing their workout
- Gives recommended weights to lift and rep range based on their preferences
- Allows user to rest and recommends the recommended time to rest based on their preferences
- Allows user to rate the workout, which will be used to generate fututre workouts

### app.py (server)
Credentials:
- Allows the user to register and stores it the database, returns error if any arise
- Allows the user to log in by reading user details from database, returns error if any arise
- When registering, the server will generate the first week of the workout plan based on user preferences

Getting workouts:
- Returns the wout plan for the week with their details
- If workouts have not been generated, the server will generate the workouts based on user history

Exercises:
- Returns the exercises for the selected day
- Return 5 extra exercises similar to the suggested ones, in case the user wants to change exercises
- Updates the database when the user changes the exercises and updates the 1RM
- Returns description for a given exercise

### GenerateWorkout.py 
This python script generates the workout plans based on user preferences and sends it back to the server. It can also generate an exercsie given the user history with that exercise.

### sql.db (Database)
This .db file stores user data, workout plans, workout days, workout exercises.

### AugmentedExercises.csv
Stores all the data about exercises.

# Installation
## 1. Clone the repository
```
bash
   git clone https://github.com/shmifful/Hercules-AI
   cd Hercules-AI
   ```
## 2. Install dependencies
```
bash 
pip install -r requirements.txt```
