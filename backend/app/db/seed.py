from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.core.security import hash_password
from backend.app.models.campus import Campus
from backend.app.models.user import User
from backend.app.models.listing import Listing
from backend.app.models.request import Request
from backend.app.models.service import Service


def seed_database(db: Session):
    # Check if demo user is already seeded
    existing_demo = db.query(User).filter(User.email == "demo@campus.edu").first()
    if existing_demo:
        return

    print("Seeding minimal, realistic CampusLoop sample data...")

    # 1. Campus
    campus = db.query(Campus).first()
    if not campus:
        campus = Campus(
            name="Apex Institute of Technology (Main Campus)",
            email_domain="campus.edu",
            city="Bengaluru",
        )
        db.add(campus)
        db.flush()

    pw_hash = hash_password("campusloop123")

    # 2. Documented Single Demo Account
    demo_user = User(
        email="demo@campus.edu",
        password_hash=pw_hash,
        full_name="Alex Chen (Demo Account)",
        campus_id=campus.id,
        department="Computer Science & Engineering",
        course="B.Tech",
        year_or_semester="Year 3 / Sem 5",
        bio="CS junior testing CampusLoop peer exchange and request features.",
        is_verified=True,
        phone="+91 98765 43210",
        show_phone=True,
        whatsapp="+91 98765 43210",
        show_whatsapp=True,
        contact_note="Available for campus exchanges weekday afternoons.",
    )

    # 3. One Campus Peer (to post sample items for the demo student to interact with)
    peer_user = User(
        email="priya.sharma@campus.edu",
        password_hash=pw_hash,
        full_name="Priya Sharma",
        campus_id=campus.id,
        department="Electronics & Communication",
        course="B.Tech",
        year_or_semester="Year 2 / Sem 3",
        bio="ECE sophomore. Interested in embedded systems, DIY audio, and campus tennis.",
        is_verified=True,
        phone="+91 91234 56789",
        show_phone=True,
        whatsapp="+91 91234 56789",
        show_whatsapp=True,
        contact_note="Prefer WhatsApp or campus email.",
    )
    db.add_all([demo_user, peer_user])
    db.flush()

    # 4. Realistic Sample Marketplace Listings (3 items)
    items = [
        Listing(
            owner_id=peer_user.id,
            campus_id=campus.id,
            title="Texas Instruments TI-84 Plus CE Graphing Calculator",
            description="Color screen graphing calculator with USB charging cable. Available to borrow/lend for calculus midterms.",
            category="Electronics & Gadgets",
            listing_mode="lend",
            price=0,
            condition="like_new",
            pickup_area="Central Library Quad / Circulation Desk",
            availability_status="available",
        ),
        Listing(
            owner_id=peer_user.id,
            campus_id=campus.id,
            title="Engineering Mechanics: Statics & Dynamics (14th Edition)",
            description="Standard textbook for first and second year core engineering. Clean pages with no missing problem sets.",
            category="Books & Notes",
            listing_mode="sell",
            price=450,
            condition="good",
            pickup_area="Main Academic Block 2 Lobby",
            availability_status="available",
        ),
        Listing(
            owner_id=peer_user.id,
            campus_id=campus.id,
            title="Portable A3 Drafting Board & T-Square with Carrying Bag",
            description="Completed engineering drawing lab coursework. Giving away this sturdy drafting board to any student who needs it.",
            category="Campus Gear & Supplies",
            listing_mode="giveaway",
            price=0,
            condition="good",
            pickup_area="Design & Architecture Building Entrance",
            availability_status="available",
        ),
    ]
    db.add_all(items)

    # 5. Realistic Sample Requests (3 requests)
    requests = [
        Request(
            requester_id=peer_user.id,
            campus_id=campus.id,
            title="Need help debugging Python graph algorithm (Breadth-First Search)",
            description="Working on a shortest-path assignment and getting an unexpected index error in my visited set. Need a 45-minute peer session to review.",
            category="Academic Help & Tutoring",
            request_type="academic_help",
            budget=350,
            preferred_arrangement="paid",
            deadline="Tomorrow 6 PM",
            status="open",
        ),
        Request(
            requester_id=peer_user.id,
            campus_id=campus.id,
            title="Looking to borrow HDMI to USB-C display adapter for lab presentation",
            description="Need a USB-C to HDMI adapter dongle for a 30-minute seminar in Seminar Hall B. Will return immediately afterwards.",
            category="Electronics & Gadgets",
            request_type="item",
            budget=0,
            preferred_arrangement="free",
            deadline="Thursday 2 PM",
            status="open",
        ),
        Request(
            requester_id=peer_user.id,
            campus_id=campus.id,
            title="Need 2 sturdy folded cardboard boxes for hostel room shift",
            description="Moving rooms between Hostel 3 and Hostel 7 this weekend. Looking for clean medium moving boxes. Can offer coffee or stationery in return!",
            category="Campus Assistance",
            request_type="task",
            budget=0,
            preferred_arrangement="exchange",
            deadline="This weekend",
            status="open",
        ),
    ]
    db.add_all(requests)

    # 6. Realistic Sample Student Services (2 services)
    services = [
        Service(
            provider_id=peer_user.id,
            campus_id=campus.id,
            title="Peer Python & Basic Algorithms 1-on-1 Tutoring",
            description="Practical 1-on-1 tutoring covering Python syntax, loops, functions, lists, dictionaries, and assignment problem solving.",
            category="Academic Help & Tutoring",
            tags="python, tutoring, programming, algorithms",
            pricing_type="hourly",
            price=250,
            availability_note="Weekdays after 5 PM, Library Study Rooms",
            status="active",
        ),
        Service(
            provider_id=peer_user.id,
            campus_id=campus.id,
            title="Presentation Slide Deck Polish & Visual Layout Formatting",
            description="I will take your draft Google Slides or PowerPoint notes and format them with clean typography, clear diagrams, and professional layout.",
            category="Design & Media",
            tags="slides, presentations, formatting, visual design",
            pricing_type="fixed",
            price=300,
            availability_note="24-hour turnaround",
            status="active",
        ),
    ]
    db.add_all(services)

    db.commit()
    print("Database seeded successfully with 1 demo account, 1 peer, 3 listings, 3 requests, and 2 services.")
