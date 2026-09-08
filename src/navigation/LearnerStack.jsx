import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SakuraWheelDashboard from '../features/dashboard/SakuraWheelDashboard';
import QuizScreen from '../features/quiz/ui/QuizScreen';
import WritingPracticeScreen from '../features/quiz/ui/WritingPracticeScreen';
import KanaPracticeScreen from '../features/quiz/ui/KanaPracticeScreen';
import WritingOrQuizChooserScreen from '../features/quiz/ui/WritingOrQuizChooserScreen';
import StudyModeChooserScreen from '../features/quiz/ui/StudyModeChooserScreen';
import FlashcardScreen from '../features/quiz/ui/FlashcardScreen';
import ListeningPracticeScreen from '../features/quiz/ui/ListeningPracticeScreen';
import SpeakingPracticeScreen from '../features/quiz/ui/SpeakingPracticeScreen';
import ReviewHubScreen from '../features/review/ui/ReviewHubScreen';
import PhoneticsScreen from '../features/quiz/ui/PhoneticsScreen';

const Stack = createNativeStackNavigator();

export default function LearnerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={SakuraWheelDashboard} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="WritingPractice" component={WritingPracticeScreen} />
      <Stack.Screen name="KanaPractice" component={KanaPracticeScreen} />
      <Stack.Screen name="WritingOrQuizChooser" component={WritingOrQuizChooserScreen} />
      <Stack.Screen name="StudyModeChooser" component={StudyModeChooserScreen} />
      <Stack.Screen name="Flashcards" component={FlashcardScreen} />
      <Stack.Screen name="ListeningPractice" component={ListeningPracticeScreen} />
      <Stack.Screen name="SpeakingPractice" component={SpeakingPracticeScreen} />
      <Stack.Screen name="ReviewHub" component={ReviewHubScreen} />
      <Stack.Screen name="Phonetics" component={PhoneticsScreen} />
    </Stack.Navigator>
  );
}