# Level Up DZ: Architecture & Business Strategy Notes

*This document contains the saved Q&A conversation regarding the platform's deployment, infrastructure, pricing, and video security strategy.*
    
---

### **Q: How do we make the email OTP system work for ALL emails (not just test accounts)?**
To make our platform send OTP emails to **any email address in the world**, you need to prove to email providers (like Google, Microsoft, and Yahoo) that you are a legitimate business. 

Resend makes this extremely easy, but it requires you to own a **Custom Domain Name** (like `levelupdz.com` or `levelupdz.dz`).

**Step 1: Purchase a Custom Domain**
Buy your domain from a registrar like Hostinger, Namecheap, or GoDaddy.

**Step 2: Add your Domain to Resend**
Go to your Resend.com Dashboard -> Domains -> Add Domain. Type your domain name and choose a region.

**Step 3: Configure your DNS Records (The Most Important Step)**
Resend will generate a table of **DNS Records**. Log into the dashboard where you bought your domain (e.g., Hostinger). Find the setting called "DNS / Nameservers". Copy the exact records Resend gave you and paste them in (TXT records and MX records).

**Step 4: Verify in Resend**
Click the "Verify DNS Records" button in Resend. Once verified, the status will turn Green.

**Step 5: Update Our Codebase**
Change the `SENDER_EMAIL` in `src/lib/mailer.ts` from the temporary Resend email to your new custom domain email (e.g., `contact@levelupdz.com`).

---

### **Q: Where do I buy my domain? I still don't know where I will store my platform.**
Building a Next.js platform requires three separate "pieces of real estate" on the internet:

**1. Where to host the Platform (The Server)**
The absolute best place to host a Next.js application is **Vercel**. It is perfectly optimized for our code and sets up in one click.

**2. Where to store the Data (The Database)**
We need a cloud database. Recommendation: **Neon** (Serverless PostgreSQL) or **Supabase**. They integrate perfectly with Vercel and Prisma.

**3. Where to buy the Domain (The Name)**
- *Option A (Easiest):* Buy it directly inside **Vercel** when we deploy the site. Vercel handles all DNS configurations automatically.
- *Option B (Cheapest):* Buy it from **Namecheap** or **Hostinger**.

---

### **Q: Let's not talk about free trials. How much will I need to be paying every month?**
If you launch the platform and have a decent amount of traffic and students, here is a realistic monthly budget:
*   **Hosting (Vercel Pro):** ~$20 / month
*   **Database (Supabase or Neon Pro):** ~$25 / month
*   **Email (Resend):** $20 / month (if sending >3,000 emails/month)
*   **Video Hosting (Cloudflare Stream/Mux):** ~$20 to $50 / month 
*   **Total Expected Cost:** **~$65 to $115 per month.** 

---

### **Q: Why are the domain prices different?**
A domain name is a commodity. **Namecheap** is a wholesale supermarket; they sell them at the cheapest possible price (~$10) but you have to do the manual technical work of linking the DNS to your server. **Vercel** is a premium service; they charge you ~$20 for the exact same domain because they charge a "convenience fee"—they configure all the DNS settings automatically so you don't have to touch a single setting.

---

### **Q: For a clean programming setup, do we need to buy this now or when we finish the project?**
**Wait until we finish the project.** 
In professional software engineering, we always build and test in a "Local Environment". If we connect to a real cloud database and server right now, every time we change a line of code, we would have to wait for it to upload to the cloud. By staying local until the project is 100% finished, our development speed is 10x faster, and you don't waste any money paying for monthly subscriptions before launch.

---

### **Q: What about Instructor Video Uploads? And preventing students from downloading or screen recording them?**
You cannot save heavy video files in a database, and Vercel does not allow you to host large video files. We will use a dedicated video streaming service like **Cloudflare Stream**, **Vimeo Pro**, or **Mux**.

Here is how we lock down your videos so they cannot be stolen:

**1. Watching Inside the Platform**
Students will never leave Level Up DZ. We will build a custom video player embedded right into your course pages.

**2. Preventing Downloads (HLS & Signed URLs)**
We will completely prevent downloading by using **HLS (HTTP Live Streaming)** instead of `.mp4` files. The streaming server chops your video into encrypted 2-second chunks. We will also use **Signed URLs**, meaning the chunks only load if the player verifies the user is logged into a paid account. Chrome download extensions will be completely useless.

**3. Preventing Screen Recording (Dynamic Watermarking)**
It is technically impossible to 100% prevent screen recording on a standard web browser (people can always point a phone at the screen). **However, we will use Dynamic Watermarking.** 
Because we know exactly who is watching the video, we will overlay the logged-in student's **Name, Phone Number, and Email Address** directly onto the video. This text will randomly bounce around the screen while they watch. If a student records the screen and posts it on Telegram or Facebook, their personal information will be plastered all over the video, allowing you to instantly identify and ban them.

---

### **Q: Do I buy a domain name once, or is it a subscription (abonnement)?**
A domain name is a **subscription (abonnement)**. You cannot buy a domain name forever; you are essentially "renting" it from the global internet registry. 
*   **How it works:** You pay for it **annually** (every year). 
*   **Cost:** It usually costs about **$10 to $15 per year** for a standard `.com` domain.
*   *Tip:* You can choose to pay for 1, 2, or up to 10 years in advance so you don't have to worry about renewing it every single year. If you forget to pay your annual fee, the domain expires and someone else can buy it!

---

### **Q: What happens after the student clicks "S'inscrire"?**
Right now, the button redirects to a placeholder enrollment page. In the final platform, the process will be:
1. **Authentication Check:** If the student is not logged in, they will be forced to log in using our secure OTP system.
2. **Payment/Enrollment:** If they are logged in, they will be taken to a payment page. For paid courses in Algeria, this usually means displaying your **CCP / BaridiMob information**. The student will transfer the money and upload a screenshot of the receipt (reçu). 
3. **Approval:** An admin (you or an instructor) verifies the receipt and clicks "Approve". 
4. **Access:** The student is officially enrolled and gains lifetime access to watch the videos!
*(Note: If the course is marked as "Free", steps 2 and 3 are skipped, and the student gets instant access).*

### **Q: Why did you put BAC, BEM, etc. in the categories instead of just subjects like Math?**
Because in the Algerian educational market, students look for courses based on their **Academic Level** first. A terminale student wants to see all BAC courses (Math, Physics, Science) grouped together. 
If we categorized only by "Math", it would mix University Math with CEM Math, which creates a confusing and poor User Experience (UX). Organizing by "Niveau Académique" makes it incredibly easy for a student to find exactly what they need.

### **Q: Why is the search bar not working?**
Because I have only built the **User Interface (UI)** (the design) so far, but I haven't written the **Backend Database Logic** to power it. Right now, it's just a visual placeholder (it even has the `disabled` property on it). Building a functional search engine requires connecting the input field directly to our Prisma database so it filters courses dynamically. I will implement the actual search functionality in the upcoming steps!
