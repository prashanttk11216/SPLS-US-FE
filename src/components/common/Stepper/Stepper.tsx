import React, { useState } from 'react';
import './Stepper.scss';

/**
 * Defines the structure of each step.
 */
export type Step = {
  label: string; // The label of the step
  content: React.ReactNode; // The content to display for the step
};

/**
 * Props for the Stepper component.
 */
export type StepperProps = {
    steps: Step[]; // Array of steps
    orientation?: 'horizontal' | 'vertical'; // Stepper orientation
    linear?: boolean; // Whether progression is linear
    onComplete?: () => void; // Callback for when the stepper is completed
    activeStep: number; // Externally controlled active step
    setActiveStep: React.Dispatch<React.SetStateAction<number>>; // External setter for active step
    completedSteps: number[];
};
  

const Stepper: React.FC<StepperProps> = ({
    steps,
    orientation = 'horizontal',
    linear = true,
    onComplete,
    activeStep,
    setActiveStep,
    completedSteps
  }) => {
  
    const isStepComplete = (stepIndex: number) =>
      completedSteps.includes(stepIndex);
  
    const handleStepClick = (stepIndex: number) => {
      if (!linear || isStepComplete(stepIndex) || stepIndex === activeStep) {
        setActiveStep(stepIndex);
      }
    };
  
    return (
      <div className={`stepper stepper-${orientation}`}>
        {/* Stepper Header */}
        <div className="stepper-header">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`stepper-step ${
                activeStep === index ? 'active' : ''
              } ${isStepComplete(index) ? 'completed' : ''}`}
              onClick={() => handleStepClick(index)}
            >
              <div className="stepper-indicator">{index + 1}</div>
              <div className="stepper-label">{step.label}</div>
              {index < steps.length - 1 && (
                <div className="stepper-connector"></div>
              )}
            </div>
          ))}
        </div>
        <div className="stepper-content">{steps[activeStep].content}</div>
      </div>
    );
  };
  

export default Stepper;
