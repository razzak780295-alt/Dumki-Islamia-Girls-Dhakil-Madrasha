# Security Specification - Dumki Islamia Girls Dakhil Madrasha

This document outlines the security architecture and rules validation specification for the Firestore database.

## 1. Data Invariants
- Each document must have a valid ID format (letters, numbers, hyphens, underscores) with a maximum length of 128 characters.
- String fields must be bounded to prevent Denial of Wallet size attacks.
- Academic status and marks must be numeric and non-negative.
- Date fields must conform to standard date strings.

## 2. Validation Blueprints & Pillars
We validate:
- **Student**: Exact keys present during creation, correct data types, and bounded string sizes.
- **Teacher**: Strict boundary checks for salaries and string properties.
- **Attendance**: Valid statuses limit ("Present", "Absent", "Late").
- **Fees**: Proper pricing and payment states.
- **Exams / Marks**: Accurate numeric limits.
- **Notices**: Verified categories.
