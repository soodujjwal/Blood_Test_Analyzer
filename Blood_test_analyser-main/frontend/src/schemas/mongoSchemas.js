// MongoDB Collection Schemas for Blood Test Analyzer
// These schemas define the structure and validation rules for MongoDB Atlas collections

export const userSchema = {
  bsonType: "object",
  required: ["email", "full_name", "password_hash", "created_at"],
  properties: {
    _id: { bsonType: "objectId" },
    email: {
      bsonType: "string",
      pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
      description: "User email address (must be unique)"
    },
    full_name: {
      bsonType: "string",
      minLength: 2,
      maxLength: 100,
      description: "User's full name"
    },
    password_hash: {
      bsonType: "string",
      description: "Hashed password (bcrypt)"
    },
    created_at: {
      bsonType: "date",
      description: "Account creation timestamp"
    },
    updated_at: {
      bsonType: "date",
      description: "Last update timestamp"
    }
  },
  additionalProperties: false
};

export const analysisHistorySchema = {
  bsonType: "object",
  required: ["user_id", "results", "analysis_response", "created_at"],
  properties: {
    _id: { bsonType: "objectId" },
    user_id: {
      bsonType: "objectId",
      description: "Reference to user who created this analysis"
    },
    results: {
      bsonType: "array",
      items: {
        bsonType: "object",
        required: ["name", "value", "unit"],
        properties: {
          name: {
            bsonType: "string",
            description: "Test name (e.g., 'Hemoglobin')"
          },
          value: {
            bsonType: "double",
            description: "Test value"
          },
          unit: {
            bsonType: "string",
            description: "Unit of measurement (e.g., 'g/dL')"
          }
        },
        additionalProperties: false
      },
      description: "Array of blood test results"
    },
    patient_info: {
      bsonType: "object",
      properties: {
        age: { bsonType: "int" },
        gender: {
          bsonType: "string",
          enum: ["M", "F", "Other"]
        },
        notes: { bsonType: "string" }
      },
      additionalProperties: false,
      description: "Optional patient demographic information"
    },
    analysis_response: {
      bsonType: "object",
      required: ["summary", "details", "suggestions"],
      properties: {
        summary: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "High-level summary of analysis"
        },
        details: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["name", "value", "unit", "reference_range", "status"],
            properties: {
              name: { bsonType: "string" },
              value: { bsonType: "double" },
              unit: { bsonType: "string" },
              reference_range: { bsonType: "string" },
              status: {
                bsonType: "string",
                enum: ["normal", "low", "high"]
              },
              note: { bsonType: "string" }
            },
            additionalProperties: false
          },
          description: "Detailed analysis for each test"
        },
        suggestions: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Health suggestions based on results"
        },
        grocery_list: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Recommended food items"
        },
        recipes: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              name: { bsonType: "string" },
              ingredients: {
                bsonType: "array",
                items: { bsonType: "string" }
              },
              instructions: {
                bsonType: "array",
                items: { bsonType: "string" }
              }
            },
            additionalProperties: false
          },
          description: "Recommended recipes"
        },
        disclaimer: {
          bsonType: "string",
          description: "Medical disclaimer"
        }
      },
      additionalProperties: false,
      description: "AI analysis response"
    },
    created_at: {
      bsonType: "date",
      description: "Analysis creation timestamp"
    }
  },
  additionalProperties: false
};

// Export as JSON for MongoDB Atlas validation rules
export const mongoDBValidation = {
  users: {
    validator: {
      $jsonSchema: userSchema
    }
  },
  analysis_history: {
    validator: {
      $jsonSchema: analysisHistorySchema
    }
  }
};
