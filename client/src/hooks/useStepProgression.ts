import { useState, useEffect, useMemo, useCallback, useRef } from "react";

export interface StepChallenge {
  id: number;
  caption: string;
  imageUrl: string;
  interests?: string[];
}

export type StepStatus = "locked" | "unlocked" | "active" | "completed";

export interface Step {
  index: number;
  challenges: StepChallenge[];
  status: StepStatus;
  thumbnailImageUrl: string | null;
  completedCount: number;
  challengeIds: number[];
}

interface ChallengeCompletion {
  challengeId: number;
  completedByDeviceId: string;
  completedByUserId: string | null;
  completedByName: string | null;
}

interface UseStepProgressionProps {
  challenges: StepChallenge[];
  completions: ChallengeCompletion[];
  challengesPerStep?: number;
}

interface UseStepProgressionResult {
  steps: Step[];
  activeStepIndex: number;
  setActiveStepIndex: (index: number) => void;
  activeStep: Step | null;
  canNavigateToStep: (index: number) => boolean;
  navigateToNextStep: () => void;
  navigateToPreviousStep: () => void;
  globalCompletedChallengeIds: Set<number>;
  totalCompletedCount: number;
}

export function useStepProgression({
  challenges,
  completions,
  challengesPerStep = 3,
}: UseStepProgressionProps): UseStepProgressionResult {
  const [activeStepIndex, setActiveStepIndexInternal] = useState(0);
  const isManualNavigation = useRef(false);
  const prevCompletedSteps = useRef<Set<number>>(new Set());

  const globalCompletedChallengeIds = useMemo(() => {
    return new Set(completions.map(c => c.challengeId));
  }, [completions]);

  const steps = useMemo(() => {
    const stepCount = Math.ceil(challenges.length / challengesPerStep);
    const result: Step[] = [];

    for (let i = 0; i < stepCount; i++) {
      const startIdx = i * challengesPerStep;
      const stepChallenges = challenges.slice(startIdx, startIdx + challengesPerStep);
      const challengeIds = stepChallenges.map(c => c.id);
      
      const completedInStep = stepChallenges.filter(c => 
        globalCompletedChallengeIds.has(c.id)
      );
      const completedCount = completedInStep.length;
      const isStepComplete = completedCount === stepChallenges.length && stepChallenges.length > 0;

      let thumbnailImageUrl: string | null = null;
      if (completedInStep.length > 0) {
        const mostRecent = completedInStep[completedInStep.length - 1];
        thumbnailImageUrl = mostRecent.imageUrl;
      }

      let status: StepStatus = "locked";
      if (i === 0) {
        status = isStepComplete ? "completed" : "unlocked";
      } else {
        const prevStepComplete = result[i - 1]?.status === "completed";
        if (isStepComplete) {
          status = "completed";
        } else if (prevStepComplete) {
          status = "unlocked";
        } else {
          status = "locked";
        }
      }

      result.push({
        index: i,
        challenges: stepChallenges,
        status,
        thumbnailImageUrl,
        completedCount,
        challengeIds,
      });
    }

    return result;
  }, [challenges, globalCompletedChallengeIds, challengesPerStep]);

  useEffect(() => {
    if (isManualNavigation.current) {
      isManualNavigation.current = false;
      return;
    }

    const currentStep = steps[activeStepIndex];
    if (!currentStep) return;
    
    const wasAlreadyCompleted = prevCompletedSteps.current.has(activeStepIndex);
    const isNowCompleted = currentStep.status === "completed";
    
    // Only auto-navigate forward when the current step just became completed
    // Never navigate backwards - this prevents refresh from moving users to previous steps
    if (isNowCompleted && !wasAlreadyCompleted) {
      const nextUnlockedIndex = steps.findIndex(
        (s, idx) => idx > activeStepIndex && (s.status === "unlocked" || s.status === "completed")
      );
      // Only navigate if the target index is greater than current (forward only)
      if (nextUnlockedIndex !== -1 && nextUnlockedIndex > activeStepIndex) {
        setActiveStepIndexInternal(nextUnlockedIndex);
      }
    }
    
    const completedStepIndices = new Set(
      steps
        .filter(s => s.status === "completed")
        .map(s => s.index)
    );
    prevCompletedSteps.current = completedStepIndices;
  }, [steps, activeStepIndex]);

  const setActiveStepIndex = useCallback((index: number) => {
    isManualNavigation.current = true;
    setActiveStepIndexInternal(index);
  }, []);

  const stepsWithActive = useMemo(() => {
    return steps.map((step, idx) => ({
      ...step,
      status: idx === activeStepIndex && step.status !== "locked" 
        ? "active" as StepStatus 
        : step.status,
    }));
  }, [steps, activeStepIndex]);

  const canNavigateToStep = useCallback((index: number) => {
    const step = steps[index];
    if (!step) return false;
    return step.status !== "locked";
  }, [steps]);

  const navigateToNextStep = useCallback(() => {
    if (activeStepIndex < steps.length - 1 && canNavigateToStep(activeStepIndex + 1)) {
      isManualNavigation.current = true;
      setActiveStepIndexInternal(activeStepIndex + 1);
    }
  }, [activeStepIndex, steps.length, canNavigateToStep]);

  const navigateToPreviousStep = useCallback(() => {
    if (activeStepIndex > 0 && canNavigateToStep(activeStepIndex - 1)) {
      isManualNavigation.current = true;
      setActiveStepIndexInternal(activeStepIndex - 1);
    }
  }, [activeStepIndex, canNavigateToStep]);

  const activeStep = stepsWithActive[activeStepIndex] || null;
  const totalCompletedCount = globalCompletedChallengeIds.size;

  return {
    steps: stepsWithActive,
    activeStepIndex,
    setActiveStepIndex,
    activeStep,
    canNavigateToStep,
    navigateToNextStep,
    navigateToPreviousStep,
    globalCompletedChallengeIds,
    totalCompletedCount,
  };
}
