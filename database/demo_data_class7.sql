-- =====================================================================
-- FEATURE DESK - DEMO DATA FOR CLASS 7 (100 STUDENTS)
-- Realistic data for India-based school system
-- =====================================================================
-- Run this AFTER supabase_schema.sql
-- =====================================================================

-- =====================================================================
-- 1. INSERT 100 CLASS 7 STUDENTS
-- =====================================================================

INSERT INTO students (id, roll_number, student_name, email, password, current_class, gender, date_of_birth, parent_name, parent_phone) VALUES
-- Row 1-25
('10000000-0000-0000-0000-000000000001', '7A001', 'Aarav Sharma', 'aarav.sharma@student.edu', '123456', 7, 'Male', '2013-03-15', 'Rajesh Sharma', '9876543001'),
('10000000-0000-0000-0000-000000000002', '7A002', 'Aanya Patel', 'aanya.patel@student.edu', '123456', 7, 'Female', '2013-05-22', 'Vikram Patel', '9876543002'),
('10000000-0000-0000-0000-000000000003', '7A003', 'Advait Gupta', 'advait.gupta@student.edu', '123456', 7, 'Male', '2013-01-10', 'Suresh Gupta', '9876543003'),
('10000000-0000-0000-0000-000000000004', '7A004', 'Aisha Khan', 'aisha.khan@student.edu', '123456', 7, 'Female', '2013-07-18', 'Imran Khan', '9876543004'),
('10000000-0000-0000-0000-000000000005', '7A005', 'Akshay Reddy', 'akshay.reddy@student.edu', '123456', 7, 'Male', '2013-02-28', 'Venkat Reddy', '9876543005'),
('10000000-0000-0000-0000-000000000006', '7A006', 'Ananya Singh', 'ananya.singh@student.edu', '123456', 7, 'Female', '2013-09-05', 'Rohit Singh', '9876543006'),
('10000000-0000-0000-0000-000000000007', '7A007', 'Arjun Verma', 'arjun.verma@student.edu', '123456', 7, 'Male', '2013-04-12', 'Amit Verma', '9876543007'),
('10000000-0000-0000-0000-000000000008', '7A008', 'Avni Joshi', 'avni.joshi@student.edu', '123456', 7, 'Female', '2013-11-25', 'Prakash Joshi', '9876543008'),
('10000000-0000-0000-0000-000000000009', '7A009', 'Dev Agarwal', 'dev.agarwal@student.edu', '123456', 7, 'Male', '2013-06-08', 'Sanjay Agarwal', '9876543009'),
('10000000-0000-0000-0000-000000000010', '7A010', 'Diya Nair', 'diya.nair@student.edu', '123456', 7, 'Female', '2013-08-30', 'Krishnan Nair', '9876543010'),
('10000000-0000-0000-0000-000000000011', '7A011', 'Gaurav Kumar', 'gaurav.kumar@student.edu', '123456', 7, 'Male', '2013-01-20', 'Ramesh Kumar', '9876543011'),
('10000000-0000-0000-0000-000000000012', '7A012', 'Ishita Rao', 'ishita.rao@student.edu', '123456', 7, 'Female', '2013-12-03', 'Narasimha Rao', '9876543012'),
('10000000-0000-0000-0000-000000000013', '7A013', 'Kabir Malhotra', 'kabir.malhotra@student.edu', '123456', 7, 'Male', '2013-10-17', 'Deepak Malhotra', '9876543013'),
('10000000-0000-0000-0000-000000000014', '7A014', 'Kavya Menon', 'kavya.menon@student.edu', '123456', 7, 'Female', '2013-03-28', 'Suresh Menon', '9876543014'),
('10000000-0000-0000-0000-000000000015', '7A015', 'Lakshya Iyer', 'lakshya.iyer@student.edu', '123456', 7, 'Male', '2013-07-09', 'Venkatesh Iyer', '9876543015'),
('10000000-0000-0000-0000-000000000016', '7A016', 'Mahi Deshmukh', 'mahi.deshmukh@student.edu', '123456', 7, 'Female', '2013-05-14', 'Ashok Deshmukh', '9876543016'),
('10000000-0000-0000-0000-000000000017', '7A017', 'Naveen Pillai', 'naveen.pillai@student.edu', '123456', 7, 'Male', '2013-02-06', 'Gopal Pillai', '9876543017'),
('10000000-0000-0000-0000-000000000018', '7A018', 'Nisha Mehta', 'nisha.mehta@student.edu', '123456', 7, 'Female', '2013-09-21', 'Rajiv Mehta', '9876543018'),
('10000000-0000-0000-0000-000000000019', '7A019', 'Om Prakash', 'om.prakash@student.edu', '123456', 7, 'Male', '2013-04-03', 'Hari Prakash', '9876543019'),
('10000000-0000-0000-0000-000000000020', '7A020', 'Priya Saxena', 'priya.saxena@student.edu', '123456', 7, 'Female', '2013-11-11', 'Alok Saxena', '9876543020'),
('10000000-0000-0000-0000-000000000021', '7A021', 'Rahul Dubey', 'rahul.dubey@student.edu', '123456', 7, 'Male', '2013-06-27', 'Vinod Dubey', '9876543021'),
('10000000-0000-0000-0000-000000000022', '7A022', 'Riya Kapoor', 'riya.kapoor@student.edu', '123456', 7, 'Female', '2013-08-08', 'Anil Kapoor', '9876543022'),
('10000000-0000-0000-0000-000000000023', '7A023', 'Rohan Bhat', 'rohan.bhat@student.edu', '123456', 7, 'Male', '2013-01-31', 'Manoj Bhat', '9876543023'),
('10000000-0000-0000-0000-000000000024', '7A024', 'Saanvi Kulkarni', 'saanvi.kulkarni@student.edu', '123456', 7, 'Female', '2013-10-05', 'Girish Kulkarni', '9876543024'),
('10000000-0000-0000-0000-000000000025', '7A025', 'Sahil Chatterjee', 'sahil.chatterjee@student.edu', '123456', 7, 'Male', '2013-12-19', 'Debashish Chatterjee', '9876543025'),
-- Row 26-50
('10000000-0000-0000-0000-000000000026', '7A026', 'Sara Ahmed', 'sara.ahmed@student.edu', '123456', 7, 'Female', '2013-03-07', 'Farhan Ahmed', '9876543026'),
('10000000-0000-0000-0000-000000000027', '7A027', 'Shaurya Mishra', 'shaurya.mishra@student.edu', '123456', 7, 'Male', '2013-07-25', 'Pankaj Mishra', '9876543027'),
('10000000-0000-0000-0000-000000000028', '7A028', 'Shreya Das', 'shreya.das@student.edu', '123456', 7, 'Female', '2013-05-02', 'Subhas Das', '9876543028'),
('10000000-0000-0000-0000-000000000029', '7A029', 'Siddharth Banerjee', 'siddharth.banerjee@student.edu', '123456', 7, 'Male', '2013-02-14', 'Amitava Banerjee', '9876543029'),
('10000000-0000-0000-0000-000000000030', '7A030', 'Simran Kaur', 'simran.kaur@student.edu', '123456', 7, 'Female', '2013-09-30', 'Gurpreet Singh', '9876543030'),
('10000000-0000-0000-0000-000000000031', '7A031', 'Tanmay Jain', 'tanmay.jain@student.edu', '123456', 7, 'Male', '2013-04-22', 'Sunil Jain', '9876543031'),
('10000000-0000-0000-0000-000000000032', '7A032', 'Tara Bhatt', 'tara.bhatt@student.edu', '123456', 7, 'Female', '2013-11-08', 'Narayan Bhatt', '9876543032'),
('10000000-0000-0000-0000-000000000033', '7A033', 'Utkarsh Pandey', 'utkarsh.pandey@student.edu', '123456', 7, 'Male', '2013-06-16', 'Shyam Pandey', '9876543033'),
('10000000-0000-0000-0000-000000000034', '7A034', 'Vanshika Chauhan', 'vanshika.chauhan@student.edu', '123456', 7, 'Female', '2013-08-24', 'Vikrant Chauhan', '9876543034'),
('10000000-0000-0000-0000-000000000035', '7A035', 'Vedant Srivastava', 'vedant.srivastava@student.edu', '123456', 7, 'Male', '2013-01-05', 'Rajeev Srivastava', '9876543035'),
('10000000-0000-0000-0000-000000000036', '7A036', 'Vidya Hegde', 'vidya.hegde@student.edu', '123456', 7, 'Female', '2013-10-28', 'Shrinivas Hegde', '9876543036'),
('10000000-0000-0000-0000-000000000037', '7A037', 'Virat Thakur', 'virat.thakur@student.edu', '123456', 7, 'Male', '2013-12-12', 'Bharat Thakur', '9876543037'),
('10000000-0000-0000-0000-000000000038', '7A038', 'Yashvi Goel', 'yashvi.goel@student.edu', '123456', 7, 'Female', '2013-03-20', 'Manoj Goel', '9876543038'),
('10000000-0000-0000-0000-000000000039', '7A039', 'Yuvraj Yadav', 'yuvraj.yadav@student.edu', '123456', 7, 'Male', '2013-07-01', 'Ram Yadav', '9876543039'),
('10000000-0000-0000-0000-000000000040', '7A040', 'Zara Siddiqui', 'zara.siddiqui@student.edu', '123456', 7, 'Female', '2013-05-19', 'Asif Siddiqui', '9876543040'),
('10000000-0000-0000-0000-000000000041', '7A041', 'Aditya Choudhary', 'aditya.choudhary@student.edu', '123456', 7, 'Male', '2013-02-25', 'Rakesh Choudhary', '9876543041'),
('10000000-0000-0000-0000-000000000042', '7A042', 'Anika Sethi', 'anika.sethi@student.edu', '123456', 7, 'Female', '2013-09-13', 'Mohit Sethi', '9876543042'),
('10000000-0000-0000-0000-000000000043', '7A043', 'Arnav Tiwari', 'arnav.tiwari@student.edu', '123456', 7, 'Male', '2013-04-29', 'Ramesh Tiwari', '9876543043'),
('10000000-0000-0000-0000-000000000044', '7A044', 'Bhavya Sharma', 'bhavya.sharma@student.edu', '123456', 7, 'Female', '2013-11-17', 'Arun Sharma', '9876543044'),
('10000000-0000-0000-0000-000000000045', '7A045', 'Chirag Rawat', 'chirag.rawat@student.edu', '123456', 7, 'Male', '2013-06-04', 'Deepak Rawat', '9876543045'),
('10000000-0000-0000-0000-000000000046', '7A046', 'Dia Nayak', 'dia.nayak@student.edu', '123456', 7, 'Female', '2013-08-15', 'Suresh Nayak', '9876543046'),
('10000000-0000-0000-0000-000000000047', '7A047', 'Dhruv Bajaj', 'dhruv.bajaj@student.edu', '123456', 7, 'Male', '2013-01-26', 'Sanjay Bajaj', '9876543047'),
('10000000-0000-0000-0000-000000000048', '7A048', 'Esha Goyal', 'esha.goyal@student.edu', '123456', 7, 'Female', '2013-10-10', 'Vivek Goyal', '9876543048'),
('10000000-0000-0000-0000-000000000049', '7A049', 'Farhan Ansari', 'farhan.ansari@student.edu', '123456', 7, 'Male', '2013-12-28', 'Zahid Ansari', '9876543049'),
('10000000-0000-0000-0000-000000000050', '7A050', 'Gauri Patil', 'gauri.patil@student.edu', '123456', 7, 'Female', '2013-03-11', 'Dinesh Patil', '9876543050'),
-- Row 51-75
('10000000-0000-0000-0000-000000000051', '7A051', 'Harsh Oberoi', 'harsh.oberoi@student.edu', '123456', 7, 'Male', '2013-07-23', 'Naresh Oberoi', '9876543051'),
('10000000-0000-0000-0000-000000000052', '7A052', 'Ira Bhargava', 'ira.bhargava@student.edu', '123456', 7, 'Female', '2013-05-08', 'Alok Bhargava', '9876543052'),
('10000000-0000-0000-0000-000000000053', '7A053', 'Ishaan Batra', 'ishaan.batra@student.edu', '123456', 7, 'Male', '2013-02-18', 'Naveen Batra', '9876543053'),
('10000000-0000-0000-0000-000000000054', '7A054', 'Jhanvi Arora', 'jhanvi.arora@student.edu', '123456', 7, 'Female', '2013-09-26', 'Suresh Arora', '9876543054'),
('10000000-0000-0000-0000-000000000055', '7A055', 'Karan Mehra', 'karan.mehra@student.edu', '123456', 7, 'Male', '2013-04-07', 'Rajesh Mehra', '9876543055'),
('10000000-0000-0000-0000-000000000056', '7A056', 'Kiara Tandon', 'kiara.tandon@student.edu', '123456', 7, 'Female', '2013-11-23', 'Vinay Tandon', '9876543056'),
('10000000-0000-0000-0000-000000000057', '7A057', 'Krish Mathur', 'krish.mathur@student.edu', '123456', 7, 'Male', '2013-06-20', 'Deepak Mathur', '9876543057'),
('10000000-0000-0000-0000-000000000058', '7A058', 'Lavanya Shukla', 'lavanya.shukla@student.edu', '123456', 7, 'Female', '2013-08-29', 'Ashish Shukla', '9876543058'),
('10000000-0000-0000-0000-000000000059', '7A059', 'Manav Kohli', 'manav.kohli@student.edu', '123456', 7, 'Male', '2013-01-14', 'Virat Kohli', '9876543059'),
('10000000-0000-0000-0000-000000000060', '7A060', 'Meera Tripathi', 'meera.tripathi@student.edu', '123456', 7, 'Female', '2013-10-21', 'Sanjay Tripathi', '9876543060'),
('10000000-0000-0000-0000-000000000061', '7A061', 'Nakul Grover', 'nakul.grover@student.edu', '123456', 7, 'Male', '2013-12-07', 'Rajat Grover', '9876543061'),
('10000000-0000-0000-0000-000000000062', '7A062', 'Navya Chandra', 'navya.chandra@student.edu', '123456', 7, 'Female', '2013-03-24', 'Arun Chandra', '9876543062'),
('10000000-0000-0000-0000-000000000063', '7A063', 'Ojas Kapadia', 'ojas.kapadia@student.edu', '123456', 7, 'Male', '2013-07-12', 'Hemant Kapadia', '9876543063'),
('10000000-0000-0000-0000-000000000064', '7A064', 'Pari Luthra', 'pari.luthra@student.edu', '123456', 7, 'Female', '2013-05-30', 'Rajesh Luthra', '9876543064'),
('10000000-0000-0000-0000-000000000065', '7A065', 'Pranav Dhawan', 'pranav.dhawan@student.edu', '123456', 7, 'Male', '2013-02-09', 'Vikram Dhawan', '9876543065'),
('10000000-0000-0000-0000-000000000066', '7A066', 'Radhika Venkat', 'radhika.venkat@student.edu', '123456', 7, 'Female', '2013-09-17', 'Subramaniam Venkat', '9876543066'),
('10000000-0000-0000-0000-000000000067', '7A067', 'Rehan Sheikh', 'rehan.sheikh@student.edu', '123456', 7, 'Male', '2013-04-26', 'Salman Sheikh', '9876543067'),
('10000000-0000-0000-0000-000000000068', '7A068', 'Riddhi Desai', 'riddhi.desai@student.edu', '123456', 7, 'Female', '2013-11-04', 'Mehul Desai', '9876543068'),
('10000000-0000-0000-0000-000000000069', '7A069', 'Rudra Trivedi', 'rudra.trivedi@student.edu', '123456', 7, 'Male', '2013-06-13', 'Ketan Trivedi', '9876543069'),
('10000000-0000-0000-0000-000000000070', '7A070', 'Sanjana Modi', 'sanjana.modi@student.edu', '123456', 7, 'Female', '2013-08-06', 'Lalit Modi', '9876543070'),
('10000000-0000-0000-0000-000000000071', '7A071', 'Shivam Gill', 'shivam.gill@student.edu', '123456', 7, 'Male', '2013-01-28', 'Shubhman Gill', '9876543071'),
('10000000-0000-0000-0000-000000000072', '7A072', 'Siya Ahuja', 'siya.ahuja@student.edu', '123456', 7, 'Female', '2013-10-15', 'Manish Ahuja', '9876543072'),
('10000000-0000-0000-0000-000000000073', '7A073', 'Surya Shankar', 'surya.shankar@student.edu', '123456', 7, 'Male', '2013-12-22', 'Ravi Shankar', '9876543073'),
('10000000-0000-0000-0000-000000000074', '7A074', 'Tanya Khanna', 'tanya.khanna@student.edu', '123456', 7, 'Female', '2013-03-05', 'Rahul Khanna', '9876543074'),
('10000000-0000-0000-0000-000000000075', '7A075', 'Tejas Rajan', 'tejas.rajan@student.edu', '123456', 7, 'Male', '2013-07-31', 'Sundar Rajan', '9876543075'),
-- Row 76-100
('10000000-0000-0000-0000-000000000076', '7A076', 'Trisha Puri', 'trisha.puri@student.edu', '123456', 7, 'Female', '2013-05-16', 'Amrit Puri', '9876543076'),
('10000000-0000-0000-0000-000000000077', '7A077', 'Varun Nanda', 'varun.nanda@student.edu', '123456', 7, 'Male', '2013-02-21', 'Gulshan Nanda', '9876543077'),
('10000000-0000-0000-0000-000000000078', '7A078', 'Veda Raghavan', 'veda.raghavan@student.edu', '123456', 7, 'Female', '2013-09-08', 'Chandrasekhar Raghavan', '9876543078'),
('10000000-0000-0000-0000-000000000079', '7A079', 'Vihaan Narang', 'vihaan.narang@student.edu', '123456', 7, 'Male', '2013-04-17', 'Mohit Narang', '9876543079'),
('10000000-0000-0000-0000-000000000080', '7A080', 'Vanya Mallik', 'vanya.mallik@student.edu', '123456', 7, 'Female', '2013-11-29', 'Sumit Mallik', '9876543080'),
('10000000-0000-0000-0000-000000000081', '7A081', 'Yash Singhania', 'yash.singhania@student.edu', '123456', 7, 'Male', '2013-06-10', 'Gautam Singhania', '9876543081'),
('10000000-0000-0000-0000-000000000082', '7A082', 'Zoya Merchant', 'zoya.merchant@student.edu', '123456', 7, 'Female', '2013-08-22', 'Adi Merchant', '9876543082'),
('10000000-0000-0000-0000-000000000083', '7A083', 'Aarush Khurana', 'aarush.khurana@student.edu', '123456', 7, 'Male', '2013-01-07', 'Rohit Khurana', '9876543083'),
('10000000-0000-0000-0000-000000000084', '7A084', 'Aditi Bose', 'aditi.bose@student.edu', '123456', 7, 'Female', '2013-10-03', 'Subrata Bose', '9876543084'),
('10000000-0000-0000-0000-000000000085', '7A085', 'Ayush Dixit', 'ayush.dixit@student.edu', '123456', 7, 'Male', '2013-12-14', 'Praveen Dixit', '9876543085'),
('10000000-0000-0000-0000-000000000086', '7A086', 'Charvi Vohra', 'charvi.vohra@student.edu', '123456', 7, 'Female', '2013-03-27', 'Aakash Vohra', '9876543086'),
('10000000-0000-0000-0000-000000000087', '7A087', 'Darsh Walia', 'darsh.walia@student.edu', '123456', 7, 'Male', '2013-07-05', 'Harpreet Walia', '9876543087'),
('10000000-0000-0000-0000-000000000088', '7A088', 'Divya Bharadwaj', 'divya.bharadwaj@student.edu', '123456', 7, 'Female', '2013-05-24', 'Sudhir Bharadwaj', '9876543088'),
('10000000-0000-0000-0000-000000000089', '7A089', 'Eklavya Roy', 'eklavya.roy@student.edu', '123456', 7, 'Male', '2013-02-03', 'Pranab Roy', '9876543089'),
('10000000-0000-0000-0000-000000000090', '7A090', 'Fatima Rizvi', 'fatima.rizvi@student.edu', '123456', 7, 'Female', '2013-09-14', 'Hassan Rizvi', '9876543090'),
('10000000-0000-0000-0000-000000000091', '7A091', 'Gautam Sinha', 'gautam.sinha@student.edu', '123456', 7, 'Male', '2013-04-01', 'Pradeep Sinha', '9876543091'),
('10000000-0000-0000-0000-000000000092', '7A092', 'Harini Venkatesh', 'harini.venkatesh@student.edu', '123456', 7, 'Female', '2013-11-19', 'Venkatesh Kumar', '9876543092'),
('10000000-0000-0000-0000-000000000093', '7A093', 'Ishan Mukherjee', 'ishan.mukherjee@student.edu', '123456', 7, 'Male', '2013-06-28', 'Soumitra Mukherjee', '9876543093'),
('10000000-0000-0000-0000-000000000094', '7A094', 'Jasleen Bedi', 'jasleen.bedi@student.edu', '123456', 7, 'Female', '2013-08-11', 'Kabir Bedi', '9876543094'),
('10000000-0000-0000-0000-000000000095', '7A095', 'Jay Vashisht', 'jay.vashisht@student.edu', '123456', 7, 'Male', '2013-01-22', 'Ashok Vashisht', '9876543095'),
('10000000-0000-0000-0000-000000000096', '7A096', 'Khushi Saini', 'khushi.saini@student.edu', '123456', 7, 'Female', '2013-10-26', 'Ramesh Saini', '9876543096'),
('10000000-0000-0000-0000-000000000097', '7A097', 'Laksh Anand', 'laksh.anand@student.edu', '123456', 7, 'Male', '2013-12-09', 'Dev Anand', '9876543097'),
('10000000-0000-0000-0000-000000000098', '7A098', 'Myra Khosla', 'myra.khosla@student.edu', '123456', 7, 'Female', '2013-03-18', 'Vishal Khosla', '9876543098'),
('10000000-0000-0000-0000-000000000099', '7A099', 'Neil Chawla', 'neil.chawla@student.edu', '123456', 7, 'Male', '2013-07-07', 'Arjun Chawla', '9876543099'),
('10000000-0000-0000-0000-000000000100', '7A100', 'Nandini Sen', 'nandini.sen@student.edu', '123456', 7, 'Female', '2013-05-12', 'Sumit Sen', '9876543100')
ON CONFLICT (roll_number) DO NOTHING;

-- =====================================================================
-- 2. ENROLL STUDENTS IN ALL SUBJECTS
-- =====================================================================

INSERT INTO student_subjects (student_id, subject_code)
SELECT s.id, sub.code
FROM students s
CROSS JOIN subjects sub
WHERE s.current_class = 7
ON CONFLICT (student_id, subject_code) DO NOTHING;

-- =====================================================================
-- 3. CREATE SAMPLE ASSESSMENTS
-- =====================================================================

-- Math Assessments
INSERT INTO assessments (id, title, description, subject_code, class_id, exam_type, total_marks, time_limit, is_active, created_by, scheduled_at, questions) VALUES
('20000000-0000-0000-0000-000000000001', 'Chapter 1: Integers - Unit Test', 'Unit test covering integers, addition and subtraction', 'MATH', 7, 'unit_test', 50, 2700, true, '00000000-0000-0000-0000-000000000001', '2026-01-15 10:00:00+05:30', '[{"id":1,"question":"What is -7 + 12?","options":["5","-5","19","-19"],"correct":0,"marks":2},{"id":2,"question":"What is (-3) × (-4)?","options":["-12","12","-7","7"],"correct":1,"marks":2},{"id":3,"question":"Which is smallest: -5, -8, 2, -1?","options":["-5","-8","2","-1"],"correct":1,"marks":2}]'),
('20000000-0000-0000-0000-000000000002', 'Chapter 2: Fractions - Weekly Quiz', 'Quick quiz on fractions and decimals', 'MATH', 7, 'quiz', 20, 1200, true, '00000000-0000-0000-0000-000000000001', '2026-01-22 10:00:00+05:30', '[{"id":1,"question":"Simplify 12/18","options":["2/3","3/4","4/6","6/9"],"correct":0,"marks":2},{"id":2,"question":"What is 1/2 + 1/4?","options":["2/6","3/4","1/6","2/4"],"correct":1,"marks":2}]'),
('20000000-0000-0000-0000-000000000003', 'Mid-Term Mathematics Exam', 'Comprehensive mid-term covering Ch 1-5', 'MATH', 7, 'mid_term', 100, 5400, true, '00000000-0000-0000-0000-000000000001', '2026-02-01 09:00:00+05:30', '[{"id":1,"question":"Solve: 2x + 5 = 15","options":["5","10","7","3"],"correct":0,"marks":5},{"id":2,"question":"Area of rectangle with l=8, b=5?","options":["40","26","13","45"],"correct":0,"marks":5}]');

-- Science Assessments
INSERT INTO assessments (id, title, description, subject_code, class_id, exam_type, total_marks, time_limit, is_active, created_by, scheduled_at, questions) VALUES
('20000000-0000-0000-0000-000000000004', 'Life Sciences - Cell Structure', 'Test on cell biology fundamentals', 'SCIENCE', 7, 'unit_test', 40, 2400, true, '00000000-0000-0000-0000-000000000001', '2026-01-18 11:00:00+05:30', '[{"id":1,"question":"Which organelle is called powerhouse of cell?","options":["Nucleus","Mitochondria","Ribosome","Golgi Body"],"correct":1,"marks":2}]'),
('20000000-0000-0000-0000-000000000005', 'Physical Sciences - Motion Quiz', 'Quick quiz on speed, velocity, acceleration', 'SCIENCE', 7, 'quiz', 25, 1500, true, '00000000-0000-0000-0000-000000000001', '2026-01-25 11:00:00+05:30', '[{"id":1,"question":"Unit of speed?","options":["m/s","kg","m","s"],"correct":0,"marks":2}]'),
('20000000-0000-0000-0000-000000000006', 'Mid-Term Science Exam', 'Comprehensive mid-term exam', 'SCIENCE', 7, 'mid_term', 100, 5400, true, '00000000-0000-0000-0000-000000000001', '2026-02-02 09:00:00+05:30', '[{"id":1,"question":"Process of making food by plants?","options":["Respiration","Photosynthesis","Digestion","Excretion"],"correct":1,"marks":5}]');

-- English Assessments
INSERT INTO assessments (id, title, description, subject_code, class_id, exam_type, total_marks, time_limit, is_active, created_by, scheduled_at, questions) VALUES
('20000000-0000-0000-0000-000000000007', 'Grammar - Tenses Test', 'Test on past, present, future tenses', 'ENGLISH', 7, 'unit_test', 40, 2400, true, '00000000-0000-0000-0000-000000000001', '2026-01-16 12:00:00+05:30', '[{"id":1,"question":"She ___ to school daily.","options":["go","goes","went","going"],"correct":1,"marks":2}]'),
('20000000-0000-0000-0000-000000000008', 'Vocabulary Quiz', 'Weekly vocabulary building quiz', 'ENGLISH', 7, 'quiz', 20, 1200, true, '00000000-0000-0000-0000-000000000001', '2026-01-23 12:00:00+05:30', '[{"id":1,"question":"Synonym of Happy?","options":["Sad","Joyful","Angry","Tired"],"correct":1,"marks":2}]');

-- Hindi Assessments
INSERT INTO assessments (id, title, description, subject_code, class_id, exam_type, total_marks, time_limit, is_active, created_by, scheduled_at, questions) VALUES
('20000000-0000-0000-0000-000000000009', 'व्याकरण परीक्षा - संज्ञा और सर्वनाम', 'संज्ञा और सर्वनाम पर परीक्षा', 'HINDI', 7, 'unit_test', 40, 2400, true, '00000000-0000-0000-0000-000000000001', '2026-01-17 14:00:00+05:30', '[{"id":1,"question":"राम एक ___ है।","options":["संज्ञा","सर्वनाम","क्रिया","विशेषण"],"correct":0,"marks":2}]'),
('20000000-0000-0000-0000-000000000010', 'साप्ताहिक हिंदी प्रश्नोत्तरी', 'Weekly Hindi quiz', 'HINDI', 7, 'quiz', 20, 1200, true, '00000000-0000-0000-0000-000000000001', '2026-01-24 14:00:00+05:30', '[{"id":1,"question":"विलोम शब्द - सुख","options":["दुख","आनंद","खुशी","प्रसन्न"],"correct":0,"marks":2}]');

-- Social Studies Assessments
INSERT INTO assessments (id, title, description, subject_code, class_id, exam_type, total_marks, time_limit, is_active, created_by, scheduled_at, questions) VALUES
('20000000-0000-0000-0000-000000000011', 'Medieval India History Test', 'Test on Mughal Empire', 'SOCIAL', 7, 'unit_test', 40, 2400, true, '00000000-0000-0000-0000-000000000001', '2026-01-19 10:00:00+05:30', '[{"id":1,"question":"Who built Taj Mahal?","options":["Akbar","Shah Jahan","Jahangir","Aurangzeb"],"correct":1,"marks":2}]'),
('20000000-0000-0000-0000-000000000012', 'Geography - Climate Zones Quiz', 'Quiz on climate zones of India', 'SOCIAL', 7, 'quiz', 20, 1200, true, '00000000-0000-0000-0000-000000000001', '2026-01-26 10:00:00+05:30', '[{"id":1,"question":"Which region receives maximum rainfall?","options":["Thar Desert","Western Ghats","Deccan Plateau","Indo-Gangetic Plains"],"correct":1,"marks":2}]');

-- Computer Science Assessments
INSERT INTO assessments (id, title, description, subject_code, class_id, exam_type, total_marks, time_limit, is_active, created_by, scheduled_at, questions) VALUES
('20000000-0000-0000-0000-000000000013', 'Programming Basics Test', 'Test on Python fundamentals', 'COMPUTER', 7, 'unit_test', 40, 2400, true, '00000000-0000-0000-0000-000000000001', '2026-01-20 15:00:00+05:30', '[{"id":1,"question":"Which is a valid variable name?","options":["2name","_name","name-1","name 1"],"correct":1,"marks":2}]'),
('20000000-0000-0000-0000-000000000014', 'Computer Hardware Quiz', 'Quiz on computer components', 'COMPUTER', 7, 'quiz', 20, 1200, true, '00000000-0000-0000-0000-000000000001', '2026-01-27 15:00:00+05:30', '[{"id":1,"question":"Brain of computer?","options":["RAM","ROM","CPU","Monitor"],"correct":2,"marks":2}]');

-- Tamil Assessments
INSERT INTO assessments (id, title, description, subject_code, class_id, exam_type, total_marks, time_limit, is_active, created_by, scheduled_at, questions) VALUES
('20000000-0000-0000-0000-000000000015', 'தமிழ் இலக்கணம் - வினைச்சொல்', 'வினைச்சொல் மற்றும் பெயர்ச்சொல் பற்றிய தேர்வு', 'TAMIL', 7, 'unit_test', 40, 2400, true, '00000000-0000-0000-0000-000000000001', '2026-01-21 14:00:00+05:30', '[{"id":1,"question":"ஓடுகிறான் என்பது ___","options":["பெயர்ச்சொல்","வினைச்சொல்","உரிச்சொல்","இடைச்சொல்"],"correct":1,"marks":2}]'),
('20000000-0000-0000-0000-000000000016', 'வாராந்திர தமிழ் வினாடி வினா', 'Weekly Tamil vocabulary quiz', 'TAMIL', 7, 'quiz', 20, 1200, true, '00000000-0000-0000-0000-000000000001', '2026-01-28 14:00:00+05:30', '[{"id":1,"question":"எதிர்ச்சொல் - இரவு","options":["பகல்","காலை","மாலை","இருள்"],"correct":0,"marks":2}]')
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 4. INSERT QUIZ RESULTS FOR ALL STUDENTS (REALISTIC SCORES)
-- =====================================================================

-- Generate results for Assessment 1 (Math Unit Test)
INSERT INTO quiz_results (student_id, assessment_id, score, total_marks, grade, time_taken, teacher_approved, submitted_at)
SELECT 
    s.id,
    '20000000-0000-0000-0000-000000000001'::uuid,
    CASE 
        WHEN random() < 0.15 THEN floor(random() * 15 + 35)::int  -- A grade (35-50)
        WHEN random() < 0.40 THEN floor(random() * 10 + 30)::int  -- B grade (30-40)
        WHEN random() < 0.70 THEN floor(random() * 10 + 20)::int  -- C grade (20-30)
        ELSE floor(random() * 10 + 10)::int                       -- D grade (10-20)
    END,
    50,
    CASE 
        WHEN random() < 0.15 THEN 'A'
        WHEN random() < 0.40 THEN 'B'
        WHEN random() < 0.70 THEN 'C'
        ELSE 'D'
    END,
    floor(random() * 600 + 1800)::int,
    true,
    '2026-01-15 11:30:00+05:30'
FROM students s WHERE s.current_class = 7;

-- Generate results for Assessment 2 (Math Quiz)
INSERT INTO quiz_results (student_id, assessment_id, score, total_marks, grade, time_taken, teacher_approved, submitted_at)
SELECT 
    s.id,
    '20000000-0000-0000-0000-000000000002'::uuid,
    floor(random() * 12 + 8)::int,
    20,
    CASE 
        WHEN random() < 0.25 THEN 'A'
        WHEN random() < 0.50 THEN 'B'
        WHEN random() < 0.80 THEN 'C'
        ELSE 'D'
    END,
    floor(random() * 300 + 600)::int,
    true,
    '2026-01-22 11:00:00+05:30'
FROM students s WHERE s.current_class = 7;

-- Generate results for Assessment 3 (Math Mid-Term)
INSERT INTO quiz_results (student_id, assessment_id, score, total_marks, grade, time_taken, teacher_approved, submitted_at)
SELECT 
    s.id,
    '20000000-0000-0000-0000-000000000003'::uuid,
    CASE 
        WHEN random() < 0.10 THEN floor(random() * 15 + 85)::int  -- A+ (85-100)
        WHEN random() < 0.30 THEN floor(random() * 15 + 70)::int  -- A (70-85)
        WHEN random() < 0.55 THEN floor(random() * 15 + 55)::int  -- B (55-70)
        WHEN random() < 0.80 THEN floor(random() * 15 + 40)::int  -- C (40-55)
        ELSE floor(random() * 15 + 25)::int                       -- D (25-40)
    END,
    100,
    CASE 
        WHEN random() < 0.10 THEN 'A+'
        WHEN random() < 0.30 THEN 'A'
        WHEN random() < 0.55 THEN 'B'
        WHEN random() < 0.80 THEN 'C'
        ELSE 'D'
    END,
    floor(random() * 1200 + 4200)::int,
    true,
    '2026-02-01 12:00:00+05:30'
FROM students s WHERE s.current_class = 7;

-- Generate results for Science Assessments
INSERT INTO quiz_results (student_id, assessment_id, score, total_marks, grade, time_taken, teacher_approved, submitted_at)
SELECT 
    s.id,
    '20000000-0000-0000-0000-000000000004'::uuid,
    floor(random() * 20 + 20)::int,
    40,
    CASE WHEN random() < 0.5 THEN 'B' ELSE 'C' END,
    floor(random() * 600 + 1500)::int,
    true,
    '2026-01-18 12:30:00+05:30'
FROM students s WHERE s.current_class = 7;

INSERT INTO quiz_results (student_id, assessment_id, score, total_marks, grade, time_taken, teacher_approved, submitted_at)
SELECT 
    s.id,
    '20000000-0000-0000-0000-000000000005'::uuid,
    floor(random() * 15 + 10)::int,
    25,
    CASE WHEN random() < 0.4 THEN 'B' ELSE 'C' END,
    floor(random() * 400 + 900)::int,
    true,
    '2026-01-25 12:30:00+05:30'
FROM students s WHERE s.current_class = 7;

-- Generate results for English Assessments
INSERT INTO quiz_results (student_id, assessment_id, score, total_marks, grade, time_taken, teacher_approved, submitted_at)
SELECT 
    s.id,
    '20000000-0000-0000-0000-000000000007'::uuid,
    floor(random() * 18 + 22)::int,
    40,
    CASE WHEN random() < 0.35 THEN 'A' WHEN random() < 0.7 THEN 'B' ELSE 'C' END,
    floor(random() * 600 + 1500)::int,
    true,
    '2026-01-16 13:30:00+05:30'
FROM students s WHERE s.current_class = 7;

INSERT INTO quiz_results (student_id, assessment_id, score, total_marks, grade, time_taken, teacher_approved, submitted_at)
SELECT 
    s.id,
    '20000000-0000-0000-0000-000000000008'::uuid,
    floor(random() * 10 + 10)::int,
    20,
    CASE WHEN random() < 0.5 THEN 'B' ELSE 'C' END,
    floor(random() * 300 + 600)::int,
    true,
    '2026-01-23 13:30:00+05:30'
FROM students s WHERE s.current_class = 7;

-- Generate results for Hindi Assessments
INSERT INTO quiz_results (student_id, assessment_id, score, total_marks, grade, time_taken, teacher_approved, submitted_at)
SELECT 
    s.id,
    '20000000-0000-0000-0000-000000000009'::uuid,
    floor(random() * 20 + 18)::int,
    40,
    CASE WHEN random() < 0.4 THEN 'B' ELSE 'C' END,
    floor(random() * 600 + 1500)::int,
    true,
    '2026-01-17 15:30:00+05:30'
FROM students s WHERE s.current_class = 7;

-- Generate results for Social Studies
INSERT INTO quiz_results (student_id, assessment_id, score, total_marks, grade, time_taken, teacher_approved, submitted_at)
SELECT 
    s.id,
    '20000000-0000-0000-0000-000000000011'::uuid,
    floor(random() * 22 + 16)::int,
    40,
    CASE WHEN random() < 0.3 THEN 'A' WHEN random() < 0.6 THEN 'B' ELSE 'C' END,
    floor(random() * 600 + 1500)::int,
    true,
    '2026-01-19 11:30:00+05:30'
FROM students s WHERE s.current_class = 7;

-- Generate results for Computer Science
INSERT INTO quiz_results (student_id, assessment_id, score, total_marks, grade, time_taken, teacher_approved, submitted_at)
SELECT 
    s.id,
    '20000000-0000-0000-0000-000000000013'::uuid,
    floor(random() * 20 + 18)::int,
    40,
    CASE WHEN random() < 0.45 THEN 'A' WHEN random() < 0.75 THEN 'B' ELSE 'C' END,
    floor(random() * 600 + 1500)::int,
    true,
    '2026-01-20 16:30:00+05:30'
FROM students s WHERE s.current_class = 7;

-- Generate results for Tamil Assessments
INSERT INTO quiz_results (student_id, assessment_id, score, total_marks, grade, time_taken, teacher_approved, submitted_at)
SELECT 
    s.id,
    '20000000-0000-0000-0000-000000000015'::uuid,
    floor(random() * 20 + 18)::int,
    40,
    CASE WHEN random() < 0.4 THEN 'A' WHEN random() < 0.7 THEN 'B' ELSE 'C' END,
    floor(random() * 600 + 1500)::int,
    true,
    '2026-01-21 15:30:00+05:30'
FROM students s WHERE s.current_class = 7;

INSERT INTO quiz_results (student_id, assessment_id, score, total_marks, grade, time_taken, teacher_approved, submitted_at)
SELECT 
    s.id,
    '20000000-0000-0000-0000-000000000016'::uuid,
    floor(random() * 12 + 8)::int,
    20,
    CASE WHEN random() < 0.5 THEN 'B' ELSE 'C' END,
    floor(random() * 300 + 600)::int,
    true,
    '2026-01-28 15:00:00+05:30'
FROM students s WHERE s.current_class = 7;

-- =====================================================================
-- 5. INSERT STUDENT NOTES
-- =====================================================================

-- Create sample notes for some students
INSERT INTO student_notes (student_id, title, content, subject_code, note_type, tags, is_favorite)
SELECT 
    s.id,
    'Chapter ' || (floor(random() * 5 + 1)::int) || ' - Key Concepts',
    'Important points from today''s class. Need to revise before the test.',
    'MATH',
    'typed',
    ARRAY['revision', 'important'],
    random() < 0.3
FROM students s WHERE s.current_class = 7 AND random() < 0.7;

INSERT INTO student_notes (student_id, title, content, subject_code, note_type, tags)
SELECT 
    s.id,
    'Cell Biology Summary',
    'Cell is the basic unit of life. Types: Plant cell and Animal cell.',
    'SCIENCE',
    'typed',
    ARRAY['biology', 'cells']
FROM students s WHERE s.current_class = 7 AND random() < 0.6;

INSERT INTO student_notes (student_id, title, content, subject_code, note_type, tags)
SELECT 
    s.id,
    'Grammar Rules - Tenses',
    'Present tense: I go. Past tense: I went. Future: I will go.',
    'ENGLISH',
    'typed',
    ARRAY['grammar', 'tenses']
FROM students s WHERE s.current_class = 7 AND random() < 0.5;

-- =====================================================================
-- 6. INSERT ATTENDANCE RECORDS (Last 30 days)
-- =====================================================================

INSERT INTO student_attendance (student_id, class_id, attendance_date, status, marked_by)
SELECT 
    s.id,
    7,
    CURRENT_DATE - (d.day_offset || ' days')::interval,
    CASE 
        WHEN random() < 0.90 THEN 'present'
        WHEN random() < 0.95 THEN 'late'
        ELSE 'absent'
    END,
    '00000000-0000-0000-0000-000000000001'::uuid
FROM students s
CROSS JOIN generate_series(1, 30) AS d(day_offset)
WHERE s.current_class = 7
  AND EXTRACT(DOW FROM CURRENT_DATE - (d.day_offset || ' days')::interval) NOT IN (0, 6)
ON CONFLICT (student_id, attendance_date) DO NOTHING;

-- =====================================================================
-- 7. INSERT LEADERBOARD DATA
-- =====================================================================

INSERT INTO leaderboard (student_id, class_id, subject_code, total_points, quiz_points, attendance_points, participation_points, peer_help_points, streak_days, level, experience_points, badges)
SELECT 
    s.id,
    7,
    sub.code,
    floor(random() * 800 + 200)::int,
    floor(random() * 400 + 100)::int,
    floor(random() * 150 + 50)::int,
    floor(random() * 100 + 20)::int,
    floor(random() * 50)::int,
    floor(random() * 15 + 1)::int,
    floor(random() * 5 + 1)::int,
    floor(random() * 2000 + 500)::int,
    CASE 
        WHEN random() < 0.2 THEN '["🏆 Top Scorer", "🔥 7-Day Streak"]'::jsonb
        WHEN random() < 0.4 THEN '["📚 Book Worm", "🎯 Perfect Score"]'::jsonb
        WHEN random() < 0.6 THEN '["🌟 Rising Star"]'::jsonb
        ELSE '[]'::jsonb
    END
FROM students s
CROSS JOIN subjects sub
WHERE s.current_class = 7
ON CONFLICT (student_id, subject_code) DO NOTHING;

-- Update ranks
WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY class_id, subject_code ORDER BY total_points DESC) as rank
    FROM leaderboard WHERE class_id = 7
)
UPDATE leaderboard SET current_rank = ranked.rank FROM ranked WHERE leaderboard.id = ranked.id;

-- =====================================================================
-- 8. INSERT STUDENT INTERACTIONS
-- =====================================================================

-- Quiz attempts
INSERT INTO student_interactions (student_id, interaction_type, related_id, subject_code, details, duration)
SELECT 
    qr.student_id,
    'quiz_attempt',
    qr.id,
    a.subject_code,
    jsonb_build_object('score', qr.score, 'total', qr.total_marks, 'grade', qr.grade),
    qr.time_taken
FROM quiz_results qr
JOIN assessments a ON qr.assessment_id = a.id;

-- Login activities
INSERT INTO student_interactions (student_id, interaction_type, details, created_at)
SELECT 
    s.id,
    'login',
    jsonb_build_object('device', 'desktop', 'browser', 'Chrome'),
    CURRENT_TIMESTAMP - (d.day_offset || ' days')::interval + (floor(random() * 8 + 8) || ' hours')::interval
FROM students s
CROSS JOIN generate_series(1, 20) AS d(day_offset)
WHERE s.current_class = 7 AND random() < 0.8;

-- =====================================================================
-- 9. INSERT PEER HELP REQUESTS
-- =====================================================================

INSERT INTO peer_help_requests (requester_id, helper_id, subject_code, topic, description, status)
SELECT 
    s1.id,
    s2.id,
    sub.code,
    CASE sub.code
        WHEN 'MATH' THEN 'Help with algebraic equations'
        WHEN 'SCIENCE' THEN 'Understanding photosynthesis'
        WHEN 'ENGLISH' THEN 'Grammar - tense confusion'
        WHEN 'HINDI' THEN 'संज्ञा और सर्वनाम'
        WHEN 'TAMIL' THEN 'வினைச்சொல் பயிற்சி'
        WHEN 'SOCIAL' THEN 'Mughal Empire history'
        ELSE 'Python programming basics'
    END,
    'Need help understanding this topic before the test.',
    CASE 
        WHEN random() < 0.4 THEN 'completed'
        WHEN random() < 0.7 THEN 'accepted'
        ELSE 'pending'
    END
FROM (SELECT id FROM students WHERE current_class = 7 ORDER BY random() LIMIT 30) s1
CROSS JOIN (SELECT id FROM students WHERE current_class = 7 ORDER BY random() LIMIT 30) s2
CROSS JOIN (SELECT code FROM subjects ORDER BY random() LIMIT 1) sub
WHERE s1.id != s2.id
LIMIT 50;

-- =====================================================================
-- 10. INSERT NOTIFICATIONS
-- =====================================================================

INSERT INTO notifications (sender_id, recipient_type, class_id, title, message, notification_type, priority) VALUES
('00000000-0000-0000-0000-000000000001', 'class', 7, 'Mid-Term Exam Schedule Released', 'Dear students, the mid-term examination schedule has been released. Please check your dashboards for subject-wise dates.', 'exam', 'high'),
('00000000-0000-0000-0000-000000000001', 'class', 7, 'Math Assignment Due', 'Complete exercises 1-20 from Chapter 3 by tomorrow. Submit in class.', 'assignment', 'normal'),
('00000000-0000-0000-0000-000000000001', 'class', 7, 'Science Project Groups', 'Project groups have been formed. Check the portal for your group members.', 'info', 'normal'),
('00000000-0000-0000-0000-000000000001', 'class', 7, 'PTM Next Week', 'Parent-Teacher Meeting scheduled for Saturday, 10 AM - 1 PM.', 'reminder', 'high'),
('00000000-0000-0000-0000-000000000001', 'class', 7, 'Hindi Poem Recitation', 'Prepare for Hindi poem recitation competition next Friday.', 'info', 'normal');

-- =====================================================================
-- END OF DEMO DATA
-- =====================================================================
