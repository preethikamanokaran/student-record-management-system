import random
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.all_models import User, Department, Course, Subject, Student, AcademicRecord, Attendance

def run_seed():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).first() is not None:
            print("Database already seeded.")
            return

        print("Seeding initial data...")

        # 1. Users
        admin_user = User(
            email="admin@college.edu",
            full_name="Dr. Robert Vance (Admin)",
            hashed_password=get_password_hash("admin123"),
            role="ADMIN"
        )
        faculty_user = User(
            email="faculty@college.edu",
            full_name="Prof. Sarah Jenkins (Faculty)",
            hashed_password=get_password_hash("faculty123"),
            role="FACULTY"
        )
        db.add(admin_user)
        db.add(faculty_user)
        db.commit()

        # 2. Departments
        d_cse = Department(code="CSE", name="Computer Science & Engineering", hod_name="Dr. Alan Turing", description="Department of CS & Emerging Technologies")
        d_ece = Department(code="ECE", name="Electronics & Communication Engineering", hod_name="Dr. Nikola Tesla", description="Department of Electronics, Communication, and Embedded Systems")
        d_mech = Department(code="MECH", name="Mechanical Engineering", hod_name="Dr. James Watt", description="Department of Mechanical Engineering and Robotics")
        db.add_all([d_cse, d_ece, d_mech])
        db.commit()

        # 3. Courses
        c1 = Course(code="BTECH-CS", name="B.Tech Computer Science & Engg", department_id=d_cse.id, duration_years=4, total_semesters=8, description="Comprehensive CS curriculum")
        c2 = Course(code="BTECH-AIDS", name="B.Tech AI & Data Science", department_id=d_cse.id, duration_years=4, total_semesters=8, description="Artificial Intelligence and Big Data Analytics")
        c3 = Course(code="BTECH-ECE", name="B.Tech Electronics & Comm", department_id=d_ece.id, duration_years=4, total_semesters=8, description="VLSI, Embedded Systems and Signals")
        c4 = Course(code="BTECH-ROB", name="B.Tech Robotics & Automation", department_id=d_mech.id, duration_years=4, total_semesters=8, description="Robotic Systems and Control Engineering")
        c5 = Course(code="BTECH-MECH", name="B.Tech Mechanical Engg", department_id=d_mech.id, duration_years=4, total_semesters=8, description="Thermal and Manufacturing Systems")
        db.add_all([c1, c2, c3, c4, c5])
        db.commit()

        # 4. Subjects
        subjects_data = [
            # CSE
            Subject(code="CS101", name="Data Structures & Algorithms", course_id=c1.id, semester=3, credits=4),
            Subject(code="CS102", name="Database Management Systems", course_id=c1.id, semester=4, credits=4),
            Subject(code="CS103", name="Web Technologies & Cloud", course_id=c1.id, semester=5, credits=3),
            Subject(code="CS104", name="Operating Systems & Kernel", course_id=c1.id, semester=4, credits=4),
            # ECE
            Subject(code="EC101", name="Digital Signal Processing", course_id=c3.id, semester=3, credits=4),
            Subject(code="EC102", name="VLSI Circuit Design", course_id=c3.id, semester=5, credits=4),
            Subject(code="EC103", name="Microprocessors & Microcontrollers", course_id=c3.id, semester=4, credits=3),
            # MECH
            Subject(code="ME101", name="Thermodynamics & Heat Transfer", course_id=c5.id, semester=3, credits=4),
            Subject(code="ME102", name="Fluid Mechanics & Dynamics", course_id=c5.id, semester=4, credits=4),
            Subject(code="ME103", name="Robotics Kinematics", course_id=c4.id, semester=5, credits=3),
        ]
        db.add_all(subjects_data)
        db.commit()

        # 5. 20 Realistic Students
        sample_students_info = [
            ("REG2023001", "Alex Mercer", "alex.mercer@college.edu", "Male", d_cse.id, c1.id, 2023, 2, 4, "A", 8.85, "ACTIVE", "9876543210"),
            ("REG2023002", "Sophia Chen", "sophia.chen@college.edu", "Female", d_cse.id, c1.id, 2023, 2, 4, "A", 9.40, "ACTIVE", "9876543211"),
            ("REG2023003", "Marcus Brody", "marcus.brody@college.edu", "Male", d_ece.id, c3.id, 2023, 2, 3, "B", 7.20, "ACTIVE", "9876543212"),
            ("REG2023004", "Emma Watson", "emma.watson@college.edu", "Female", d_cse.id, c2.id, 2024, 1, 2, "A", 8.90, "ACTIVE", "9876543213"),
            ("REG2023005", "David Miller", "david.miller@college.edu", "Male", d_mech.id, c5.id, 2022, 3, 6, "A", 5.80, "ACTIVE", "9876543214"),  # Low CGPA risk
            ("REG2023006", "Olivia Taylor", "olivia.taylor@college.edu", "Female", d_ece.id, c3.id, 2023, 2, 4, "B", 8.10, "ACTIVE", "9876543215"),
            ("REG2023007", "Liam Johnson", "liam.johnson@college.edu", "Male", d_cse.id, c1.id, 2023, 2, 3, "A", 7.85, "ACTIVE", "9876543216"),
            ("REG2023008", "Ava Martinez", "ava.martinez@college.edu", "Female", d_mech.id, c4.id, 2024, 1, 1, "A", 9.15, "ACTIVE", "9876543217"),
            ("REG2023009", "Ethan Hunt", "ethan.hunt@college.edu", "Male", d_cse.id, c2.id, 2023, 2, 4, "B", 6.40, "ACTIVE", "9876543218"),
            ("REG20230010", "Isabella Ross", "isabella.ross@college.edu", "Female", d_ece.id, c3.id, 2022, 3, 5, "A", 8.60, "ACTIVE", "9876543219"),
            ("REG20230011", "Noah Williams", "noah.williams@college.edu", "Male", d_mech.id, c5.id, 2023, 2, 3, "B", 7.40, "ACTIVE", "9876543220"),
            ("REG20230012", "Mia Anderson", "mia.anderson@college.edu", "Female", d_cse.id, c1.id, 2021, 4, 8, "A", 9.65, "GRADUATED", "9876543221"),
            ("REG20230013", "Lucas Garcia", "lucas.garcia@college.edu", "Male", d_cse.id, c2.id, 2023, 2, 3, "A", 5.40, "ACTIVE", "9876543222"),  # Academic risk
            ("REG20230014", "Charlotte Brown", "charlotte.brown@college.edu", "Female", d_ece.id, c3.id, 2024, 1, 2, "A", 8.30, "ACTIVE", "9876543223"),
            ("REG20230015", "James Wilson", "james.wilson@college.edu", "Male", d_mech.id, c4.id, 2023, 2, 4, "B", 7.10, "ACTIVE", "9876543224"),
            ("REG20230016", "Amelia Thomas", "amelia.thomas@college.edu", "Female", d_cse.id, c1.id, 2023, 2, 3, "A", 8.95, "ACTIVE", "9876543225"),
            ("REG20230017", "Benjamin Clark", "benjamin.clark@college.edu", "Male", d_ece.id, c3.id, 2022, 3, 6, "A", 6.80, "ACTIVE", "9876543226"),
            ("REG20230018", "Harper White", "harper.white@college.edu", "Female", d_mech.id, c5.id, 2023, 2, 4, "A", 8.45, "ACTIVE", "9876543227"),
            ("REG20230019", "Henry Harris", "henry.harris@college.edu", "Male", d_cse.id, c2.id, 2024, 1, 1, "B", 7.70, "ACTIVE", "9876543228"),
            ("REG20230020", "Evelyn Martin", "evelyn.martin@college.edu", "Female", d_ece.id, c3.id, 2023, 2, 4, "A", 9.05, "ACTIVE", "9876543229"),
        ]

        created_students = []
        for reg, name, email, gender, dept_id, course_id, adm_yr, yr, sem, sec, cgpa, status, phone in sample_students_info:
            st = Student(
                register_number=reg,
                full_name=name,
                dob="2003-05-15",
                gender=gender,
                email=email,
                phone=phone,
                address="123 Campus Avenue, University City",
                profile_photo=None,
                department_id=dept_id,
                course_id=course_id,
                batch=f"{adm_yr}-{adm_yr+4}",
                year=yr,
                semester=sem,
                section=sec,
                admission_year=adm_yr,
                cgpa=cgpa,
                academic_status=status,
                parent_name=f"Mr. {name.split()[-1]} Guardian",
                parent_relationship="Father",
                parent_phone="9876500000",
                parent_email=f"parent.{email}",
                parent_occupation="Engineer",
                parent_address="123 Campus Avenue, University City",
                blood_group="O+",
                emergency_contact="9876500000",
                skills="Python, React, SQL, Problem Solving",
                certifications="AWS Certified Cloud Practitioner",
                achievements="First Prize in National Hackathon 2023",
                extracurriculars="College Debate Team Leader, Chess Club Member"
            )
            db.add(st)
            created_students.append(st)
        
        db.commit()

        # 6. Create Student User account for student 1 (Alex Mercer) as student@college.edu
        first_student = created_students[0]
        student_user = User(
            email="student@college.edu",
            full_name=first_student.full_name,
            hashed_password=get_password_hash("student123"),
            role="STUDENT",
            student_id=first_student.id
        )
        db.add(student_user)
        db.commit()

        # Also create student accounts for all other students with student123
        for st in created_students[1:]:
            s_u = User(
                email=st.email,
                full_name=st.full_name,
                hashed_password=get_password_hash("student123"),
                role="STUDENT",
                student_id=st.id
            )
            db.add(s_u)
        db.commit()

        # 7. Add Academic Records & Attendance for each student
        all_subjects = db.query(Subject).all()

        for st in created_students:
            # Pick 3-4 subjects for student
            relevant_subjects = [s for s in all_subjects if s.course_id == st.course_id]
            if not relevant_subjects:
                relevant_subjects = all_subjects[:3]

            for sbj in relevant_subjects:
                # Academic Record
                internal = round(random.uniform(30, 48), 1)
                external = round(random.uniform(35, 50), 1)
                if st.cgpa < 6.0:  # Intentionally lower for low cgpa students
                    internal = round(random.uniform(15, 25), 1)
                    external = round(random.uniform(20, 30), 1)
                
                tot = round(internal + external, 1)
                if tot >= 90:
                    g, gp = "O", 10.0
                elif tot >= 80:
                    g, gp = "A+", 9.0
                elif tot >= 70:
                    g, gp = "A", 8.0
                elif tot >= 60:
                    g, gp = "B+", 7.0
                elif tot >= 50:
                    g, gp = "B", 6.0
                elif tot >= 40:
                    g, gp = "C", 5.0
                else:
                    g, gp = "F", 0.0

                arc = AcademicRecord(
                    student_id=st.id,
                    subject_id=sbj.id,
                    internal_marks=internal,
                    external_marks=external,
                    total_marks=tot,
                    grade=g,
                    grade_point=gp,
                    semester=sbj.semester,
                    academic_year="2023-2024"
                )
                db.add(arc)

                # Attendance Record
                tot_cls = 50
                # Make a couple of students have low attendance (<75%)
                if st.id in [3, 5, 9]:
                    attended = random.randint(25, 34)  # 50-68%
                else:
                    attended = random.randint(40, 49)  # 80-98%

                absent = tot_cls - attended
                pct = round((attended / tot_cls) * 100, 1)

                att = Attendance(
                    student_id=st.id,
                    subject_id=sbj.id,
                    total_classes=tot_cls,
                    classes_attended=attended,
                    classes_absent=absent,
                    attendance_percentage=pct,
                    month="Overall",
                    academic_year="2023-2024"
                )
                db.add(att)

        db.commit()
        print("Seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
