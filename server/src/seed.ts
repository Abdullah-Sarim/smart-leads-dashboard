import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { Lead } from '../models/lead.model.js';
import { UserRole, LeadStatus, LeadSource } from '../types/index.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI!;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'admin123',
    role: UserRole.Admin,
  },
  {
    name: 'Sales User',
    email: 'sales@demo.com',
    password: 'sales123',
    role: UserRole.Sales,
  },
];

const seedLeads = [
  { name: 'Rahul Sharma', email: 'rahul.sharma@techcorp.com', status: LeadStatus.New, source: LeadSource.Website },
  { name: 'Priya Patel', email: 'priya.patel@startup.io', status: LeadStatus.Contacted, source: LeadSource.Instagram },
  { name: 'Amit Singh', email: 'amit.singh@enterprise.net', status: LeadStatus.Qualified, source: LeadSource.Referral },
  { name: 'Sneha Gupta', email: 'sneha.gupta@innovate.com', status: LeadStatus.Lost, source: LeadSource.Website },
  { name: 'Vikram Mehta', email: 'vikram.mehta@digitalsol.com', status: LeadStatus.New, source: LeadSource.Instagram },
  { name: 'Ananya Reddy', email: 'ananya.reddy@webworks.co', status: LeadStatus.Contacted, source: LeadSource.Referral },
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@cloudtech.io', status: LeadStatus.Qualified, source: LeadSource.Website },
  { name: 'Kavita Joshi', email: 'kavita.joshi@nexus.com', status: LeadStatus.New, source: LeadSource.Instagram },
  { name: 'Arun Verma', email: 'arun.verma@byteworks.net', status: LeadStatus.Contacted, source: LeadSource.Website },
  { name: 'Meera Nair', email: 'meera.nair@softsol.com', status: LeadStatus.Qualified, source: LeadSource.Referral },
  { name: 'Suresh Iyer', email: 'suresh.iyer@techhub.io', status: LeadStatus.New, source: LeadSource.Instagram },
  { name: 'Lakshmi Devi', email: 'lakshmi.devi@dataflow.com', status: LeadStatus.Lost, source: LeadSource.Website },
  { name: 'Kiran Rao', email: 'kiran.rao@infotech.net', status: LeadStatus.Contacted, source: LeadSource.Referral },
  { name: 'Deepa Krishnan', email: 'deepa.krishnan@apexsol.com', status: LeadStatus.Qualified, source: LeadSource.Website },
  { name: 'Naresh Pillai', email: 'naresh.pillai@nexgen.io', status: LeadStatus.New, source: LeadSource.Instagram },
  { name: 'Sunita Mishra', email: 'sunita.mishra@webdev.com', status: LeadStatus.Contacted, source: LeadSource.Website },
  { name: 'Gopal Krishna', email: 'gopal.krishna@codebase.net', status: LeadStatus.Qualified, source: LeadSource.Referral },
  { name: 'Rashmi Agarwal', email: 'rashmi.agarwal@digital.io', status: LeadStatus.New, source: LeadSource.Instagram },
  { name: 'Mohan Das', email: 'mohan.das@cybertech.com', status: LeadStatus.Contacted, source: LeadSource.Website },
  { name: 'Anita Choudhury', email: 'anita.choudhury@techwave.net', status: LeadStatus.Qualified, source: LeadSource.Referral },
  { name: 'Sanjay Bose', email: 'sanjay.bose@sysops.io', status: LeadStatus.New, source: LeadSource.Instagram },
  { name: 'Geeta Saxena', email: 'geeta.saxena@devops.com', status: LeadStatus.Lost, source: LeadSource.Website },
  { name: 'Prakash Menon', email: 'prakash.menon@cloudsys.net', status: LeadStatus.Contacted, source: LeadSource.Referral },
  { name: 'Madhuri Kapoor', email: 'madhuri.kapoor@networks.io', status: LeadStatus.Qualified, source: LeadSource.Website },
  { name: 'Vijay Thakur', email: 'vijay.thakur@sysnet.com', status: LeadStatus.New, source: LeadSource.Instagram },
  { name: 'Ritu Saxena', email: 'ritu.saxena@techpro.net', status: LeadStatus.Contacted, source: LeadSource.Website },
  { name: 'Ashok Chatterjee', email: 'ashok.chatterjee@digihub.io', status: LeadStatus.Qualified, source: LeadSource.Referral },
  { name: 'Nisha Bansal', email: 'nisha.bansal@webloc.com', status: LeadStatus.New, source: LeadSource.Instagram },
];

async function seed(): Promise<void> {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');

    console.log('Clearing existing data...');
    await User.deleteMany({ email: { $in: seedUsers.map((u) => u.email) } });
    await Lead.deleteMany({ email: { $in: seedLeads.map((l) => l.email) } });
    console.log('Existing seeded data cleared\n');

    console.log('Seeding users...');
    const users = await User.insertMany(
      seedUsers.map((u) => ({
        ...u,
        password: bcrypt.hashSync(u.password, 10),
      }))
    );
    const salesUser = users.find((u) => u.role === UserRole.Sales)!;
    console.log(`Created ${users.length} users\n`);

    console.log('Seeding leads...');
    const leads = seedLeads.map((lead) => ({
      ...lead,
      createdBy: salesUser._id,
    }));
    await Lead.insertMany(leads);
    console.log(`Created ${leads.length} leads\n`);

    console.log('Seed completed successfully');
    console.log('\nTest Credentials:');
    console.log('  Admin:  admin@demo.com / admin123');
    console.log('  Sales:  sales@demo.com / sales123');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();