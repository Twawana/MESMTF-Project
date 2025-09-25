import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Diagnosis from '../models/Diagnosis.js';
import Prescription from '../models/Prescription.js';

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample users data (matching the frontend localStorage structure)
const sampleUsers = [
  {
    username: 'patient.john',
    email: 'john.doe@email.com',
    password: 'patient123',
    name: 'John Doe',
    role: 'patient',
    profile: {
      phone: '+264 81 234 5678',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'Male',
      address: '123 Main Street, Windhoek'
    }
  },
  {
    username: 'dr.smith',
    email: 'dr.smith@moh.gov',
    password: 'doctor123',
    name: 'Dr. Sarah Smith',
    role: 'doctor',
    profile: {
      phone: '+264 81 345 6789',
      specialization: 'Internal Medicine',
      licenseNumber: 'MD12345',
      department: 'Internal Medicine'
    }
  },
  {
    username: 'nurse.jane',
    email: 'jane.wilson@moh.gov',
    password: 'nurse123',
    name: 'Jane Wilson',
    role: 'nurse',
    profile: {
      phone: '+264 81 456 7890',
      department: 'General Ward',
      licenseNumber: 'RN67890'
    }
  },
  {
    username: 'pharm.mike',
    email: 'm.johnson@moh.gov',
    password: 'pharm123',
    name: 'Mike Johnson',
    role: 'pharmacist',
    profile: {
      phone: '+264 81 567 8901',
      licenseNumber: 'PH54321',
      department: 'Pharmacy'
    }
  },
  {
    username: 'recep.mary',
    email: 'm.wilson@moh.gov',
    password: 'recep123',
    name: 'Mary Wilson',
    role: 'receptionist',
    profile: {
      phone: '+264 81 678 9012',
      department: 'Reception'
    }
  },
  {
    username: 'admin',
    email: 'admin@moh.gov',
    password: 'admin123',
    name: 'System Administrator',
    role: 'admin',
    profile: {
      phone: '+264 81 789 0123',
      department: 'IT Administration'
    }
  }
];

// Sample patients data
const samplePatients = [
  {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'Male',
    phone: '+264 81 234 5678',
    email: 'john.doe@email.com',
    address: {
      street: '123 Main Street',
      city: 'Windhoek',
      state: 'Khomas',
      zipCode: '10001',
      country: 'Namibia'
    },
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+264 81 234 5679'
    },
    medicalHistory: {
      allergies: ['Penicillin'],
      chronicConditions: [],
      bloodType: 'O+',
      notes: 'No significant medical history'
    }
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: new Date('1985-08-22'),
    gender: 'Female',
    phone: '+264 82 345 6789',
    email: 'jane.smith@email.com',
    address: {
      street: '456 Oak Avenue',
      city: 'Windhoek',
      state: 'Khomas',
      zipCode: '10002',
      country: 'Namibia'
    },
    emergencyContact: {
      name: 'Robert Smith',
      relationship: 'Husband',
      phone: '+264 82 345 6790'
    },
    medicalHistory: {
      allergies: [],
      chronicConditions: ['Hypertension'],
      bloodType: 'A+',
      notes: 'Regular blood pressure monitoring required'
    }
  },
  {
    firstName: 'Michael',
    lastName: 'Brown',
    dateOfBirth: new Date('1978-12-10'),
    gender: 'Male',
    phone: '+264 83 456 7890',
    email: 'michael.brown@email.com',
    address: {
      street: '789 Pine Road',
      city: 'Windhoek',
      state: 'Khomas',
      zipCode: '10003',
      country: 'Namibia'
    },
    emergencyContact: {
      name: 'Sarah Brown',
      relationship: 'Wife',
      phone: '+264 83 456 7891'
    },
    medicalHistory: {
      allergies: ['Aspirin'],
      chronicConditions: ['Diabetes Type 2'],
      bloodType: 'B+',
      notes: 'Diabetic patient, regular glucose monitoring'
    }
  }
];

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Diagnosis.deleteMany({});
    await Prescription.deleteMany({});
    console.log('✅ Existing data cleared');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    const users = await User.create(sampleUsers);
    console.log('✅ Users seeded successfully');
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

// Seed patients
const seedPatients = async (users) => {
  try {
    // Link first patient to the patient user
    const patientUser = users.find(u => u.role === 'patient');
    if (patientUser) {
      samplePatients[0].userId = patientUser._id;
    }

    const patients = await Patient.create(samplePatients);
    console.log('✅ Patients seeded successfully');
    return patients;
  } catch (error) {
    console.error('❌ Error seeding patients:', error);
    process.exit(1);
  }
};

// Seed appointments
const seedAppointments = async (users, patients) => {
  try {
    const doctor = users.find(u => u.role === 'doctor');
    const receptionist = users.find(u => u.role === 'receptionist');
    
    const sampleAppointments = [
      {
        patient: patients[0]._id,
        doctor: doctor._id,
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        reason: 'Routine checkup and fever symptoms',
        type: 'consultation',
        status: 'scheduled',
        duration: 30,
        createdBy: receptionist._id
      },
      {
        patient: patients[1]._id,
        doctor: doctor._id,
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        reason: 'Blood pressure monitoring',
        type: 'follow-up',
        status: 'confirmed',
        duration: 20,
        createdBy: receptionist._id
      },
      {
        patient: patients[2]._id,
        doctor: doctor._id,
        appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        reason: 'Diabetes management consultation',
        type: 'routine-checkup',
        status: 'scheduled',
        duration: 45,
        createdBy: receptionist._id
      }
    ];

    const appointments = await Appointment.create(sampleAppointments);
    console.log('✅ Appointments seeded successfully');
    return appointments;
  } catch (error) {
    console.error('❌ Error seeding appointments:', error);
    process.exit(1);
  }
};

// Seed diagnoses
const seedDiagnoses = async (users, patients, appointments) => {
  try {
    const doctor = users.find(u => u.role === 'doctor');
    
    const sampleDiagnoses = [
      {
        patient: patients[0]._id,
        doctor: doctor._id,
        appointment: appointments[0]._id,
        symptoms: [
          { symptom: 'fever', severity: 'moderate', duration: '3 days' },
          { symptom: 'headache', severity: 'mild', duration: '2 days' },
          { symptom: 'fatigue', severity: 'moderate', duration: '3 days' }
        ],
        diagnosis: {
          primary: 'Suspected Malaria',
          confidence: 75,
          notes: 'Patient presents with classic malaria symptoms'
        },
        malariaAssessment: {
          riskLevel: 'moderate',
          testResults: {
            rapidTest: 'not-done',
            microscopy: 'not-done'
          }
        },
        typhoidAssessment: {
          riskLevel: 'low',
          testResults: {
            widalTest: 'not-done'
          }
        },
        treatment: {
          medications: [
            {
              name: 'Artemether-Lumefantrine',
              dosage: '20mg/120mg',
              frequency: 'Twice daily',
              duration: '3 days',
              instructions: 'Take with food'
            }
          ],
          generalInstructions: 'Rest, plenty of fluids, return if symptoms worsen'
        },
        followUp: {
          required: true,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          instructions: 'Return in 1 week for follow-up'
        }
      }
    ];

    const diagnoses = await Diagnosis.create(sampleDiagnoses);
    console.log('✅ Diagnoses seeded successfully');
    return diagnoses;
  } catch (error) {
    console.error('❌ Error seeding diagnoses:', error);
    process.exit(1);
  }
};

// Seed prescriptions
const seedPrescriptions = async (users, patients, diagnoses) => {
  try {
    const doctor = users.find(u => u.role === 'doctor');
    
    const samplePrescriptions = [
      {
        patient: patients[0]._id,
        doctor: doctor._id,
        diagnosis: diagnoses[0]._id,
        medications: [
          {
            name: 'Artemether-Lumefantrine',
            genericName: 'Artemether-Lumefantrine',
            dosage: '20mg/120mg',
            frequency: 'Twice daily',
            duration: '3 days',
            quantity: 6,
            instructions: 'Take with food to improve absorption',
            unitPrice: 15.50,
            totalPrice: 93.00
          },
          {
            name: 'Paracetamol',
            genericName: 'Acetaminophen',
            dosage: '500mg',
            frequency: 'Every 6 hours as needed',
            duration: '5 days',
            quantity: 20,
            instructions: 'For fever and pain relief',
            unitPrice: 0.25,
            totalPrice: 5.00
          }
        ],
        instructions: 'Complete the full course of antimalarial medication even if feeling better. Return immediately if symptoms worsen.',
        priority: 'urgent',
        status: 'pending'
      }
    ];

    const prescriptions = await Prescription.create(samplePrescriptions);
    console.log('✅ Prescriptions seeded successfully');
    return prescriptions;
  } catch (error) {
    console.error('❌ Error seeding prescriptions:', error);
    process.exit(1);
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    await clearData();
    
    const users = await seedUsers();
    const patients = await seedPatients(users);
    const appointments = await seedAppointments(users, patients);
    const diagnoses = await seedDiagnoses(users, patients, appointments);
    const prescriptions = await seedPrescriptions(users, patients, diagnoses);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Seeded data summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Patients: ${patients.length}`);
    console.log(`   Appointments: ${appointments.length}`);
    console.log(`   Diagnoses: ${diagnoses.length}`);
    console.log(`   Prescriptions: ${prescriptions.length}`);
    
    console.log('\n🔐 Default login credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Doctor: dr.smith / doctor123');
    console.log('   Nurse: nurse.jane / nurse123');
    console.log('   Pharmacist: pharm.mike / pharm123');
    console.log('   Receptionist: recep.mary / recep123');
    console.log('   Patient: patient.john / patient123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
const isMainModule = process.argv[1] && process.argv[1].endsWith('seedData.js');
if (isMainModule) {
  seedDatabase();
}

export default seedDatabase;
