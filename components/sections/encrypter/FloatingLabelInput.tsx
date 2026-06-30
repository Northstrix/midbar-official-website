"use client";

import React, { useState, useCallback } from "react";

export interface FloatingLabelInputProps {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  textarea?: boolean;
  isRTL?: boolean;
  accentColor?: string;
  textareaHeight?: string;
  parentBackground?: string;
  inputOutlineColor?: string;
  outlineWidth?: string;
  foregroundColor?: string;
  mutedForegroundColor?: string;
  rounding?: string;
  inputPadding?: string;
  inputFontSize?: string;
  labelFontSize?: string;
  labelActiveFontSize?: string;
  labelPadding?: string;
  labelActivePadding?: string;
  inputHeight?: string;
  readOnly?: boolean;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value = "",
  onValueChange,
  type = "text",
  autoComplete = "off",
  required = false,
  disabled = false,
  textarea = false,
  isRTL = false,
  accentColor = "var(--accent)",
  textareaHeight = "192px",
  parentBackground = "var(--footer-background)",
  inputOutlineColor = "var(--border-color)",
  outlineWidth = "1.5px",
  foregroundColor = "var(--foreground)",
  mutedForegroundColor = "var(--floating-label-input-muted-foreground)",
  rounding = "var(--border-radius)",
  inputPadding = "17px",
  inputFontSize = "1.025rem",
  labelFontSize = "1.025rem",
  labelActiveFontSize = "12px",
  labelPadding = "0 7px",
  labelActivePadding = "0 6px",
  inputHeight = "49px",
  readOnly = false,
}) => {
  const [focused, setFocused] = useState(false);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!readOnly) onValueChange(e.target.value);
    },
    [onValueChange, readOnly]
  );

  const hasValue = value !== undefined && value !== null && value.length > 0;
  const shouldLabelFloat = readOnly ? hasValue : focused || hasValue;

  // Prevent tabbing onto empty read-only inputs
  const dynamicTabIndex = readOnly ? (hasValue ? 0 : -1) : undefined;

  return (
    <div
      className={`mobile-form-group w-full relative block m-0 p-0 text-left clear-both ${
        isRTL ? "rtl-label" : "ltr-label"
      } ${focused && !readOnly ? "active" : ""} ${hasValue ? "has-value" : ""} ${
        textarea ? "textarea" : ""
      } ${readOnly ? "is-readonly" : ""}`}
    >
      {textarea ? (
        <textarea
          required={required}
          value={value}
          onChange={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          disabled={disabled}
          readOnly={readOnly}
          tabIndex={dynamicTabIndex}
          dir={isRTL ? "rtl" : "ltr"}
          spellCheck={false}
          className="mobile-form-input text-element"
        />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          disabled={disabled}
          readOnly={readOnly}
          tabIndex={dynamicTabIndex}
          dir={isRTL ? "rtl" : "ltr"}
          spellCheck={false}
          className="mobile-form-input text-element"
        />
      )}

      <label
        className={`mobile-form-label ${textarea ? "label-textarea" : ""} ${
          shouldLabelFloat ? "is-floating" : ""
        }`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {label}
      </label>

      <style jsx>{`
        .mobile-form-group {
          width: 100%;
        }
        .mobile-form-group :global(.text-element),
        .mobile-form-input {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          width: 100% !important;
          height: ${textarea ? "192px" : inputHeight} !important;
          min-height: ${textarea ? "192px" : inputHeight} !important;
          max-height: ${textarea ? "192px" : inputHeight} !important;
          padding: ${inputPadding} !important;
          font-size: ${inputFontSize} !important;
          font-family: inherit !important;
          font-weight: 400 !important;
          color: ${foregroundColor} !important;
          caret-color: ${foregroundColor} !important;
          background: ${parentBackground} !important;
          border: ${outlineWidth} solid ${inputOutlineColor} !important;
          border-radius: ${rounding} !important;
          outline: none !important;
          box-sizing: border-box !important;
          position: relative !important;
          z-index: 5 !important;
          transition: border-color 0.25s ease-in-out;
          resize: none !important;
        }

        /* Standard interactive elements focus color behavior */
        .mobile-form-group:not(.is-readonly) .mobile-form-input:focus {
          border-color: var(--floating-label-active-outline-color) !important;
        }

        /* Read-only variant: change outline on hover OR on focus-visible */
        .mobile-form-group.is-readonly:hover .mobile-form-input,
        .mobile-form-group.is-readonly .mobile-form-input:focus-visible {
          border-color: var(--floating-label-active-outline-color) !important;
        }

        .mobile-form-input:disabled {
          opacity: 0.4 !important;
          pointer-events: none !important;
        }

        .mobile-form-label {
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
          position: absolute !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          color: ${mutedForegroundColor} !important;
          font-size: ${labelFontSize} !important;
          font-weight: 400 !important;
          background: ${parentBackground} !important;
          padding: ${labelPadding} !important;
          pointer-events: none !important;
          z-index: 10 !important;
          transition: transform 0.2s ease, top 0.2s ease, font-size 0.2s ease, color 0.2s ease;
          white-space: nowrap !important;
        }

        .mobile-form-group.ltr-label .mobile-form-label {
          left: 14px !important;
          right: auto !important;
        }

        .mobile-form-group.rtl-label .mobile-form-label {
          right: 14px !important;
          left: auto !important;
        }

        .mobile-form-label.is-floating {
          top: 0px !important;
          transform: translateY(-50%) !important;
          font-size: ${labelActiveFontSize} !important;
          padding: ${labelActivePadding} !important;
          background: ${parentBackground} !important;
        }

        /* Standard hover rules */
        .mobile-form-group:not(.is-readonly):hover .mobile-form-label {
          color: var(--floating-label-active-outline-color) !important;
        }
        .mobile-form-group.active:hover .mobile-form-label {
          color: ${accentColor} !important;
        }

        /* Read-only variant: Match exact standard active/focused color maps on container hover */
        .mobile-form-group.is-readonly:hover .mobile-form-label {
          color: var(--floating-label-active-outline-color) !important;
        }
        .mobile-form-group.is-readonly:hover .mobile-form-label.is-floating {
          color: ${accentColor} !important;
        }

        /* Standard active element focus & Value States */
        .mobile-form-group.active .mobile-form-label {
          color: ${accentColor} !important;
        }
        .mobile-form-group.has-value:not(.active):not(.is-readonly) .mobile-form-label {
          color: var(--floating-label-active-outline-color) !important;
        }

        /* Read-only variant keyboard accessibility: update floating label color on focus-visible */
        .mobile-form-group.is-readonly .mobile-form-input:focus-visible ~ .mobile-form-label.is-floating {
          color: ${accentColor} !important;
        }

        .mobile-form-group.textarea .mobile-form-label:not(.is-floating) {
          top: 14px !important;
          transform: none !important;
        }
      `}</style>
    </div>
  );
};

export default FloatingLabelInput;