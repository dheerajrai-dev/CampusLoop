from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from backend.app.core.security import hash_password
from backend.app.models.campus import Campus
from backend.app.models.user import User
from backend.app.models.listing import Listing, ListingImage
from backend.app.models.request import Request, Offer
from backend.app.models.service import Service
from backend.app.models.transaction import Transaction
from backend.app.models.review import Review


def seed_database(db: Session):
    # Check if already seeded
    if db.query(Campus).count() > 0:
        return

    print("Seeding CampusLoop database with realistic student data...")

    # 1. Campuses
    campus_iit = Campus(
        name="Apex Institute of Technology (Main Campus)",
        email_domain="campus.edu",
        city="Bengaluru",
    )
    campus_du = Campus(
        name="Metro State University (North Campus)",
        email_domain="metro.edu",
        city="New Delhi",
    )
    db.add_all([campus_iit, campus_du])
    db.flush()

    # Password for demo accounts
    demo_pw = hash_password("campus123")

    # 2. Demo Users (Fictional students labeled as Demo)
    aarav = User(
        email="aarav@campus.edu",
        password_hash=demo_pw,
        full_name="Aarav Sharma (Demo Requester)",
        campus_id=campus_iit.id,
        department="Computer Science & Engineering",
        course="B.Tech",
        year_or_semester="Year 3 / Sem 5",
        bio="CS junior passionate about distributed systems and hackathons. Always looking for study partners and design help.",
        is_verified=True,
    )
    meera = User(
        email="meera@campus.edu",
        password_hash=demo_pw,
        full_name="Meera Patel (Demo Provider)",
        campus_id=campus_iit.id,
        department="Design & Visual Arts",
        course="B.Des",
        year_or_semester="Year 4 / Sem 7",
        bio="Senior UI/UX & graphic design student. Available for presentation polishing, branding, and Figma setups.",
        is_verified=True,
    )
    rohan = User(
        email="rohan@campus.edu",
        password_hash=demo_pw,
        full_name="Rohan Verma (Demo Student)",
        campus_id=campus_iit.id,
        department="Mechanical Engineering",
        course="B.Tech",
        year_or_semester="Year 2 / Sem 3",
        bio="Avid cyclist, mechanical tinkerer, and physics peer tutor.",
        is_verified=True,
    )
    ananya = User(
        email="ananya@campus.edu",
        password_hash=demo_pw,
        full_name="Ananya Iyer (Demo Student)",
        campus_id=campus_iit.id,
        department="Mathematics & Computing",
        course="Integrated M.Sc",
        year_or_semester="Year 3 / Sem 6",
        bio="Python & Data Structures enthusiast. Happy to help freshmen with programming and calculus.",
        is_verified=True,
    )
    karan = User(
        email="karan@campus.edu",
        password_hash=demo_pw,
        full_name="Karan Malhotra (Demo Student)",
        campus_id=campus_iit.id,
        department="Electrical Engineering",
        course="B.Tech",
        year_or_semester="Year 4 / Sem 8",
        bio="Graduating senior clearing out lab gear, textbooks, and electronic components.",
        is_verified=True,
    )
    db.add_all([aarav, meera, rohan, ananya, karan])
    db.flush()

    # 3. Items / Listings (8-12 items across sell, lend, giveaway, exchange)
    now = datetime.now(timezone.utc)
    items = [
        Listing(
            owner_id=karan.id,
            campus_id=campus_iit.id,
            title="Texas Instruments TI-84 Plus CE Graphing Calculator",
            description="Perfect condition with USB charging cable and slide case. Essential for advanced calculus and statistics courses.",
            category="Electronics & Gadgets",
            listing_mode="sell",
            price=3200.0,
            condition="like_new",
            pickup_area="Library Quad or Hostel 4 Common Room",
            availability_status="available",
            created_at=now - timedelta(hours=3),
        ),
        Listing(
            owner_id=rohan.id,
            campus_id=campus_iit.id,
            title="Introduction to Algorithms (CLRS 3rd Edition)",
            description="Hardcover edition. Clean pages with minimal pencil highlights. Offering to lend for the entire semester or sell.",
            category="Books & Notes",
            listing_mode="lend",
            price=0.0,
            condition="good",
            pickup_area="Mechanical Engineering Workshop Plaza",
            availability_status="available",
            created_at=now - timedelta(hours=6),
        ),
        Listing(
            owner_id=ananya.id,
            campus_id=campus_iit.id,
            title="White Cotton Lab Coat (Size M)",
            description="Standard campus chemistry/physics lab coat. Freshly washed, no chemical stains. Giving away for free to any 1st year student.",
            category="Campus Gear & Uniforms",
            listing_mode="giveaway",
            price=0.0,
            condition="good",
            pickup_area="Science Complex Main Lobby",
            availability_status="available",
            created_at=now - timedelta(hours=10),
        ),
        Listing(
            owner_id=meera.id,
            campus_id=campus_iit.id,
            title="Wacom One Drawing Tablet with Stylus",
            description="13.3-inch pen display. Great for digital art, 3D sculpting, or notes. Want to exchange for an iPad stylus or second monitor.",
            category="Electronics & Gadgets",
            listing_mode="exchange",
            price=0.0,
            condition="like_new",
            pickup_area="Design Department Studio 2",
            availability_status="available",
            created_at=now - timedelta(hours=14),
        ),
        Listing(
            owner_id=aarav.id,
            campus_id=campus_iit.id,
            title="Sony WH-CH520 Wireless Bluetooth Headphones",
            description="Lightweight headphones with 50-hour battery life. Used for one semester. Great sound quality for focused library study.",
            category="Electronics & Gadgets",
            listing_mode="sell",
            price=1800.0,
            condition="like_new",
            pickup_area="Central Cafeteria",
            availability_status="available",
            created_at=now - timedelta(days=1),
        ),
        Listing(
            owner_id=rohan.id,
            campus_id=campus_iit.id,
            title="Heavy-Duty Bicycle U-Lock with 2 Keys",
            description="Kryptonite-style security lock to keep your campus cycle safe at hostel stands. Selling because I bought a folding bike.",
            category="Vehicles & Sports",
            listing_mode="sell",
            price=450.0,
            condition="good",
            pickup_area="Hostel 2 Cycle Parking",
            availability_status="available",
            created_at=now - timedelta(days=2),
        ),
        Listing(
            owner_id=karan.id,
            campus_id=campus_iit.id,
            title="Digital Multimeter & Breadboard Kit",
            description="Basic electronics lab toolkit. Useful for EE/ECE 1st & 2nd year circuits lab. Lending for project weeks.",
            category="Electronics & Gadgets",
            listing_mode="lend",
            price=0.0,
            condition="good",
            pickup_area="Electrical Department Front Lawn",
            availability_status="available",
            created_at=now - timedelta(days=2, hours=4),
        ),
        Listing(
            owner_id=ananya.id,
            campus_id=campus_iit.id,
            title="Discrete Mathematics and Its Applications (Rosen)",
            description="Clear textbook for CS/Math students. Exchange for Linear Algebra textbook or donate to incoming freshman.",
            category="Books & Notes",
            listing_mode="exchange",
            price=0.0,
            condition="good",
            pickup_area="Math Department Reading Room",
            availability_status="available",
            created_at=now - timedelta(days=3),
        ),
    ]
    db.add_all(items)
    db.flush()

    # 4. Services (6-8 realistic campus services)
    services = [
        Service(
            provider_id=meera.id,
            campus_id=campus_iit.id,
            title="Academic & Pitch Deck Presentation Polishing",
            description="Transform boring PowerPoint/Google Slides into clean, aesthetic, publication-ready presentations. Includes custom layouts and charts.",
            category="Design & Media",
            tags="presentation, slides, figma, design, pitch",
            pricing_type="fixed",
            price=400.0,
            availability_note="Evenings & Weekends, 24h turnaround possible",
            status="active",
            created_at=now - timedelta(days=5),
        ),
        Service(
            provider_id=ananya.id,
            campus_id=campus_iit.id,
            title="Python, Data Structures & Algorithm Peer Tutoring",
            description="1-on-1 tutoring for introductory and intermediate CS courses. LeetCode practice, code debugging, and mock technical interviews.",
            category="Academic Help & Tutoring",
            tags="python, dsa, algorithms, coding, tutor",
            pricing_type="hourly",
            price=300.0,
            availability_note="Monday, Wednesday, Friday after 5 PM",
            status="active",
            created_at=now - timedelta(days=4),
        ),
        Service(
            provider_id=aarav.id,
            campus_id=campus_iit.id,
            title="Dual-Boot Linux & Developer Environment Setup",
            description="Help setting up Ubuntu/Debian alongside Windows or macOS. Docker, VS Code, Git, and C++/Python toolchain installation.",
            category="Tech & Device Support",
            tags="linux, dual-boot, docker, environment, git",
            pricing_type="free",
            price=0.0,
            availability_note="Available weekends at the Computer Center",
            status="active",
            created_at=now - timedelta(days=3),
        ),
        Service(
            provider_id=karan.id,
            campus_id=campus_iit.id,
            title="Campus Event & Club Photography",
            description="Equipped with Sony A7III full-frame mirrorless. High-res portrait sessions, club events, farewell photos, and LinkedIn headshots.",
            category="Design & Media",
            tags="photography, portrait, camera, event, linkedin",
            pricing_type="hourly",
            price=500.0,
            availability_note="Available Saturday & Sunday all day",
            status="active",
            created_at=now - timedelta(days=2),
        ),
        Service(
            provider_id=rohan.id,
            campus_id=campus_iit.id,
            title="Campus Cycle Tune-up & Puncture Repair",
            description="Quick brake adjustment, gear indexing, chain lubrication, and inner tube replacement so you never miss a 9 AM lecture.",
            category="Campus Assistance",
            tags="cycle, repair, maintenance, campus",
            pricing_type="negotiable",
            price=150.0,
            availability_note="Daily 4 PM - 7 PM near Hostel 2",
            status="active",
            created_at=now - timedelta(days=1),
        ),
        Service(
            provider_id=meera.id,
            campus_id=campus_iit.id,
            title="Campus Club Poster & Social Media Graphic Design",
            description="Eye-catching festival flyers, Instagram banners, and club recruitments designed in Illustrator and Figma.",
            category="Design & Media",
            tags="poster, graphics, instagram, flyer, branding",
            pricing_type="fixed",
            price=350.0,
            availability_note="1-2 day turnaround",
            status="active",
            created_at=now - timedelta(hours=18),
        ),
    ]
    db.add_all(services)
    db.flush()

    # 5. Requests (8-12 realistic requests across categories)
    req1 = Request(
        requester_id=aarav.id,
        campus_id=campus_iit.id,
        title="Need a 10-slide presentation polished by tomorrow",
        description="I have rough draft slides with text and charts for my OS term project. Need someone with good design taste to format typography and layout.",
        category="Design & Media",
        request_type="task",
        budget=400.0,
        preferred_arrangement="paid",
        deadline="Tomorrow 6 PM",
        status="open",
        created_at=now - timedelta(hours=2),
    )
    req2 = Request(
        requester_id=rohan.id,
        campus_id=campus_iit.id,
        title="Need to borrow an HDMI to USB-C dongle for 2 hours",
        description="Giving my seminar presentation in Room 302 today. My laptop only has USB-C ports. Will return immediately after 4 PM.",
        category="Electronics & Gadgets",
        request_type="item",
        budget=0.0,
        preferred_arrangement="free",
        deadline="Today 2 PM",
        status="open",
        created_at=now - timedelta(hours=1),
    )
    req3 = Request(
        requester_id=ananya.id,
        campus_id=campus_iit.id,
        title="Someone travelling to North Campus printing shop?",
        description="Need 40 pages of project report spiral-bound on 100gsm paper. North shop has better rates. Can pay delivery incentive.",
        category="Campus Assistance",
        request_type="campus_help",
        budget=150.0,
        preferred_arrangement="paid",
        deadline="Today 7 PM",
        status="open",
        created_at=now - timedelta(hours=4),
    )
    req4 = Request(
        requester_id=karan.id,
        campus_id=campus_iit.id,
        title="Looking for peer help with Dynamic Programming problems",
        description="Preparing for upcoming technical placement interviews. Want to solve 15 medium LeetCode DP problems with a study partner.",
        category="Academic Help & Tutoring",
        request_type="academic_help",
        budget=0.0,
        preferred_arrangement="exchange",
        deadline="This weekend",
        status="open",
        created_at=now - timedelta(hours=8),
    )
    req5 = Request(
        requester_id=aarav.id,
        campus_id=campus_iit.id,
        title="Borrowing a multimeter for weekend robotics project",
        description="Building a small IoT greenhouse sensor node. Need to verify 5V / 3.3V power rails. Will return safely on Monday morning.",
        category="Electronics & Gadgets",
        request_type="item",
        budget=0.0,
        preferred_arrangement="free",
        deadline="Friday evening",
        status="open",
        created_at=now - timedelta(days=1),
    )
    db.add_all([req1, req2, req3, req4, req5])
    db.flush()

    # 6. Completed Transaction & Review to demonstrate trust & reputation
    completed_req = Request(
        requester_id=rohan.id,
        campus_id=campus_iit.id,
        title="Urgent assistance formatting LaTeX thesis template",
        description="Need margins, references bibtex, and chapter headers aligned with university submission handbook.",
        category="Academic Help & Tutoring",
        request_type="task",
        budget=350.0,
        preferred_arrangement="paid",
        deadline="Yesterday",
        status="completed",
        created_at=now - timedelta(days=4),
    )
    db.add(completed_req)
    db.flush()

    completed_offer = Offer(
        request_id=completed_req.id,
        provider_id=ananya.id,
        message="I have formatted 3 IEEE papers and our senior project in LaTeX. Can get this done in 2 hours.",
        proposed_price=300.0,
        availability_note="Completed yesterday evening",
        status="completed",
        created_at=now - timedelta(days=4, hours=2),
    )
    db.add(completed_offer)
    db.flush()

    completed_txn = Transaction(
        request_id=completed_req.id,
        offer_id=completed_offer.id,
        requester_or_buyer_id=rohan.id,
        provider_or_owner_id=ananya.id,
        status="completed",
        completion_confirmed_by_requester=True,
        completion_confirmed_by_provider=True,
        created_at=now - timedelta(days=4),
        completed_at=now - timedelta(days=3),
    )
    db.add(completed_txn)
    db.flush()

    review_from_rohan = Review(
        transaction_id=completed_txn.id,
        reviewer_id=rohan.id,
        reviewee_id=ananya.id,
        rating=5,
        comment="Ananya is amazing! Fixed all my LaTeX compile errors in under an hour and added beautiful figure captions. Highly recommend!",
        created_at=now - timedelta(days=3),
    )
    review_from_ananya = Review(
        transaction_id=completed_txn.id,
        reviewer_id=ananya.id,
        reviewee_id=rohan.id,
        rating=5,
        comment="Great communication from Rohan. Clear requirements and prompt confirmation.",
        created_at=now - timedelta(days=3),
    )
    db.add_all([review_from_rohan, review_from_ananya])

    db.commit()
    print("Database seeding completed successfully!")
