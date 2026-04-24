Great — now that you’ve accepted **campaign_time_window** (or whatever name you choose), the next smart move is to understand **all remaining edge cases** you must handle to make your DOOH Manager _bullet‑proof_.

Below is the **complete, real‑world edge‑case checklist** used by actual DOOH platforms.  
I’m giving you the ones that matter for your schema, your player logic, and your Angular UI.

---

# ⭐ 1. CAMPAIGN–LEVEL EDGE CASES

### **1.1 Campaign has no ads**

- Campaign is approved but has **zero ads**
- Campaign is scheduled but cannot play
- UI should block status change

### **1.2 Campaign has ads but all are rejected/expired**

- Campaign becomes unplayable
- Should auto‑move to `rejected` or `draft`

### **1.3 Campaign start_time > end_time**

- Already handled by your CHECK constraint
- But UI must validate too

### **1.4 Campaign start_time is in the past**

- If user tries to schedule a campaign that already started
- Should auto‑adjust or warn

### **1.5 Campaign end_time is too soon for all ads to rotate**

Example:

- Campaign has 10 ads × 10 seconds = 100 seconds
- Campaign ends in 30 seconds  
    → Impossible to deliver full rotation

You must decide:

- Allow partial rotation
- Or block scheduling

---

# ⭐ 2. SCREEN–LEVEL EDGE CASES

### **2.1 Screen is offline**

- Campaign is active but screen is not reporting
- Proof‑of‑play should mark `interrupted`
- Player should retry when online

### **2.2 Screen orientation mismatch**

- Campaign ads are landscape
- Screen is portrait  
    → Should block assignment or auto‑filter ads

### **2.3 Screen resolution mismatch**

- Ad resolution too small or too large
- Should warn or auto‑scale

### **2.4 Screen operating hours conflict**

Example:

- Screen runs 10:00–18:00
- Campaign wants 08:00–10:00  
    → No playable window

You must:

- Warn user
- Or silently skip that screen

---

# ⭐ 3. SCHEDULE–LEVEL EDGE CASES

### **3.1 Campaign has no time windows**

If schedule_type = always → OK  
If schedule_type = daily/weekly but no times → INVALID

### **3.2 Multiple time windows overlap**

Example:

- Window 1: 10:00–14:00
- Window 2: 13:00–16:00  
    → Overlap

You must merge or reject.

### **3.3 Weekly schedule but invalid days**

- days_of_week = ""
- days_of_week = "Mon,Mon"
- days_of_week = "Funday"

### **3.4 Frequency too small**

Example:

- frequency_seconds = 1  
    → Player will overload

Set minimum like 10 seconds.

### **3.5 Frequency too large**

Example:

- frequency_seconds = 36000 (10 hours)  
    → Campaign may never play

Warn user.

---

# ⭐ 4. PLAYBACK ENGINE EDGE CASES

### **4.1 Two campaigns want to play at the same time**

You need a rule:

- Priority
- Round‑robin
- Weighted rotation
- First‑come‑first‑serve

### **4.2 Campaign with higher priority interrupts another**

If priority exists:

- Should it interrupt immediately
- Or wait for current ad to finish

### **4.3 Campaign ends while an ad is playing**

Should the ad:

- Finish
- Or stop immediately

### **4.4 Player clock drift**

If device time is wrong:

- Campaign may play outside window
- You need NTP sync or server time override

---

# ⭐ 5. PROOF‑OF‑PLAY EDGE CASES

### **5.1 Player fails to send POP**

- Offline
- Network error
- App crash

You must:

- Queue POP locally
- Retry later
- Mark as delayed

### **5.2 POP duration mismatch**

Example:

- Ad duration = 10 seconds
- POP reports 2 seconds  
    → Interrupted

### **5.3 POP for expired campaign**

If POP arrives late:

- Should still store
- But mark as `late`

---

# ⭐ 6. DATA INTEGRITY EDGE CASES

### **6.1 Deleting a screen**

- What happens to campaign_screen rows
- Should soft‑delete cascade

### **6.2 Deleting an ad**

- Campaign_ad must soft‑delete
- Campaign may become invalid

### **6.3 Deleting a campaign**

- POP rows must remain
- But campaign should be marked deleted

### **6.4 Tenant isolation**

- No cross‑tenant data leakage
- All queries must filter by tenant_id

---

# ⭐ 7. UI/UX EDGE CASES (Angular)

### **7.1 User assigns screens but forgets to add time window**

Campaign becomes “scheduled” but unplayable.

### **7.2 User adds ads but forgets play_order**

You must auto‑assign play_order.

### **7.3 User adds overlapping time windows**

UI should merge or warn.

### **7.4 User assigns campaign to screen with different orientation**

UI should show a warning badge.

---

# ⭐ 8. BUSINESS LOGIC EDGE CASES

### **8.1 Campaign approved but screens are inactive**

Should campaign be allowed to activate?

### **8.2 Campaign approved but ads are still under_review**

Block scheduling.

### **8.3 Campaign approved but no time window**

Block scheduling.

### **8.4 Campaign approved but screen is in maintenance**

Skip that screen.

---

# ⭐ 9. PLAYER–SERVER SYNC EDGE CASES

### **9.1 Player downloads ads late**

Campaign starts but ads not downloaded yet.

### **9.2 Player misses schedule update**

Campaign changes but player still uses old schedule.

### **9.3 Player timezone mismatch**

Screen in Nepal  
Server in UTC  
Campaign windows must convert correctly.

---

# ⭐ 10. FUTURE FEATURES YOU MIGHT ADD (and their edge cases)

### **10.1 Per‑screen time windows**

Campaign plays differently on each screen.

### **10.2 Impression caps**

Campaign stops after X plays.

### **10.3 Budget‑based campaigns**

Campaign stops after budget exhausted.

### **10.4 Dynamic pricing**

Screens cost more at peak hours.

---

# 🔥 Final Summary (What you must handle next)

Here are the **top 10 edge cases you should implement first**:

1. Campaign has no ads
2. Campaign has no screens
3. Campaign has no time windows
4. Screen offline
5. Orientation mismatch
6. Time window outside screen hours
7. Overlapping time windows
8. Frequency too small/large
9. Two campaigns competing for same slot
10. POP missing or delayed

These are the ones that will break your system if not handled.

---

# 👉 Want me to generate a **full validation flow**

for:

- Campaign creation
- Campaign approval
- Campaign scheduling
- Player playback
- Proof‑of‑play

I can map every edge case into a clean step‑by‑step flowchart or SQL/Angular validation rules.