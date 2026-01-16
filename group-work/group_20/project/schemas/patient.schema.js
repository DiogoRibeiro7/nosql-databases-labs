export const patientSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "patientId",
      "demographics",
      "medicalHistory",
      "createdAt",
      "updatedAt"
    ],
    properties: {
      patientId: {
        bsonType: "string",
        description: "Identificador único do paciente"
      },
      demographics: {
        bsonType: "object",
        required: ["firstName", "lastName", "dateOfBirth", "gender", "contact"],
        properties: {
          firstName: {
            bsonType: "string",
            description: "Primeiro nome do paciente"
          },
          lastName: {
            bsonType: "string",
            description: "Último nome do paciente"
          },
          dateOfBirth: {
            bsonType: "date",
            description: "Data de nascimento"
          },
          gender: {
            bsonType: "string",
            enum: ["male", "female", "other"],
            description: "Género"
          },
          ssn: {
            bsonType: "string",
            description: "Número de identificação (encriptado)"
          },
          contact: {
            bsonType: "object",
            required: ["phone", "email"],
            properties: {
              phone: {
                bsonType: "string",
                description: "Número de telefone"
              },
              email: {
                bsonType: "string",
                description: "Endereço de email"
              },
              address: {
                bsonType: "object",
                properties: {
                  street: { bsonType: "string" },
                  city: { bsonType: "string" },
                  state: { bsonType: "string" },
                  zipCode: { bsonType: "string" }
                }
              }
            }
          }
        }
      },
      emergency: {
        bsonType: "array",
        items: {
          bsonType: "object",
          properties: {
            name: { bsonType: "string" },
            relationship: { bsonType: "string" },
            phone: { bsonType: "string" }
          }
        }
      },
      insurance: {
        bsonType: "array",
        items: {
          bsonType: "object",
          properties: {
            provider: { bsonType: "string" },
            policyNumber: { bsonType: "string" },
            groupNumber: { bsonType: "string" },
            effectiveDate: { bsonType: "date" },
            expirationDate: { bsonType: "date" }
          }
        }
      },
      allergies: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["allergen", "severity", "status"],
          properties: {
            allergen: { bsonType: "string" },
            reaction: { bsonType: "string" },
            severity: {
              enum: ["mild", "moderate", "severe"]
            },
            onsetDate: { bsonType: "date" },
            status: {
              enum: ["active", "inactive"]
            }
          }
        }
      },
      medications: {
        bsonType: "array",
        items: {
          bsonType: "object",
          properties: {
            name: { bsonType: "string" },
            dosage: { bsonType: "string" },
            frequency: { bsonType: "string" },
            prescribedBy: { bsonType: "objectId" },
            startDate: { bsonType: "date" },
            endDate: { bsonType: "date" },
            status: {
              enum: ["active", "discontinued", "completed"]
            }
          }
        }
      },
      medicalHistory: {
        bsonType: "object",
        properties: {
          conditions: {
            bsonType: "array",
            items: {
              bsonType: "object",
              properties: {
                diagnosis: { bsonType: "string" },
                icdCode: { bsonType: "string" },
                diagnosedDate: { bsonType: "date" },
                status: {
                  enum: ["active", "resolved", "chronic"]
                }
              }
            }
          },
          surgeries: {
            bsonType: "array",
            items: {
              bsonType: "object",
              properties: {
                procedure: { bsonType: "string" },
                date: { bsonType: "date" },
                hospital: { bsonType: "string" },
                surgeon: { bsonType: "string" },
                notes: { bsonType: "string" }
              }
            }
          },
          familyHistory: {
            bsonType: "array",
            items: {
              bsonType: "object",
              properties: {
                relationship: { bsonType: "string" },
                condition: { bsonType: "string" },
                ageAtDiagnosis: { bsonType: "int" }
              }
            }
          }
        }
      },
      preferences: {
        bsonType: "object",
        properties: {
          language: { bsonType: "string" },
          communicationMethod: { bsonType: "string" },
          consentFlags: {
            bsonType: "object",
            properties: {
              shareWithSpecialists: { bsonType: "bool" },
              researchParticipation: { bsonType: "bool" },
              marketingCommunication: { bsonType: "bool" }
            }
          }
        }
      },
      tags: {
        bsonType: "array",
        items: { bsonType: "string" }
      },
      createdAt: {
        bsonType: "date"
      },
      updatedAt: {
        bsonType: "date"
      }
    }
  }
};
