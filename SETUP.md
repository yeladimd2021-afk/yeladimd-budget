# מדריך הגדרה — מערכת ניהול תקציב מחלקה ד׳

## תוכן עניינים
1. [דרישות מקדימות](#דרישות-מקדימות)
2. [הגדרת Firebase](#הגדרת-firebase)
3. [התקנת הפרויקט](#התקנת-הפרויקט)
4. [יצירת משתמש אדמין ראשון](#יצירת-משתמש-אדמין-ראשון)
5. [טעינת נתוני דוגמה](#טעינת-נתוני-דוגמה)
6. [הסברים על תפקידים](#הסברים-על-תפקידים)
7. [פריסה לאינטרנט](#פריסה-לאינטרנט)

---

## דרישות מקדימות

- Node.js 18+
- npm / yarn
- חשבון Google (לFirebase)

---

## הגדרת Firebase

### שלב 1: יצירת פרויקט Firebase

1. היכנס ל־ https://console.firebase.google.com
2. לחץ **"Add project"** → תן שם לפרויקט (לדוגמה: `department-d-budget`)
3. בחר האם להפעיל Google Analytics (לא חובה)
4. המתן לסיום היצירה

### שלב 2: הפעלת Authentication

1. בתפריט הצדדי: **Build → Authentication**
2. לחץ **"Get started"**
3. בלשונית **Sign-in method**, לחץ על **Email/Password**
4. הפעל "Email/Password" ולחץ **Save**

### שלב 3: יצירת Firestore Database

1. **Build → Firestore Database**
2. לחץ **"Create database"**
3. בחר **"Start in production mode"** (נשתמש בRules שלנו)
4. בחר אזור: **europe-west3** (פרנקפורט) — הקרוב לישראל
5. לחץ **Done**

#### העלאת Security Rules:
1. ב-Firestore, לחץ לשונית **"Rules"**
2. מחק את כל התוכן
3. העתק את תוכן הקובץ `firestore.rules` מהפרויקט
4. לחץ **"Publish"**

#### העלאת Indexes:
1. לחץ לשונית **"Indexes"**
2. לחץ **"Add index"** — או השתמש ב-Firebase CLI (ראה למטה)

### שלב 4: הגדרת Firebase Storage

1. **Build → Storage**
2. לחץ **"Get started"**
3. בחר **"Start in production mode"**
4. בחר אזור זהה ל-Firestore
5. לחץ **"Done"**

#### העלאת Storage Rules:
1. לחץ לשונית **"Rules"**
2. מחק תוכן קיים
3. העתק תוכן `storage.rules`
4. לחץ **"Publish"**

### שלב 5: קבלת מפתחות הגדרה

1. בלחצן gear ⚙️ → **Project settings**
2. גלול ל-**"Your apps"** → לחץ **"Web"** `</>`
3. תן שם לאפליקציה
4. **לא** לסמן Firebase Hosting בשלב זה
5. לחץ **Register app**
6. העתק את `firebaseConfig`

---

## התקנת הפרויקט

### שלב 1: שכפול/פתיחת התיקייה

```bash
cd department-d-budget
```

### שלב 2: התקנת תלויות

```bash
npm install
```

### שלב 3: הגדרת משתני סביבה

```bash
cp .env.local.example .env.local
```

פתח `.env.local` והכנס את ערכי הFirebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234...
```

### שלב 4: הפעלת שרת פיתוח

```bash
npm run dev
```

פתח http://localhost:3000

---

## יצירת משתמש אדמין ראשון

### שיטה 1: דרך Firebase Console (מומלץ)

1. ב-Firebase Console: **Authentication → Users**
2. לחץ **"Add user"**
3. הכנס אימייל + סיסמה
4. העתק את ה-**UID** שנוצר

5. עכשיו עבור ל-**Firestore → Data**
6. לחץ **"Start collection"** → `users`
7. כ-Document ID הכנס את ה-**UID** שהעתקת
8. הוסף שדות:

| שדה | סוג | ערך |
|-----|-----|-----|
| email | string | כתובת האימייל שלך |
| displayName | string | השם שלך |
| role | string | **admin** |
| isActive | boolean | true |
| createdAt | timestamp | (לחץ על שעון) |

### שיטה 2: דרך הקוד (אחרי כניסה ראשונה)

1. הכנס למערכת עם המשתמש שיצרת
2. פתח את ה-Firestore ידנית ועדכן `role: "admin"`

---

## טעינת נתוני דוגמה

לאחר כניסה כ-Admin:

1. עבור ל: http://localhost:3000/settings/seed
2. לחץ **"טען נתוני דוגמה"**

זה ייצור:
- 8 קטגוריות ברירת מחדל
- שנות תקציב 2024, 2025, 2026
- 10+ הוצאות לדוגמה בעברית
- הגדרות מערכת בסיסיות

**חשוב: הרץ פעם אחת בלבד!**

---

## הסברים על תפקידים

### Admin (מנהל מערכת)
- גישה מלאה לכל הפונקציות
- ניהול משתמשים (הוסף/ערוך/השבת)
- מחיקת הוצאות
- ניהול הגדרות מערכת
- ניהול קטגוריות
- ניהול שנות תקציב

### Editor (עורך)
- הוספה ועריכה של הוצאות
- העלאת קבצים (קבלות)
- עדכון סטטוס החזר
- **לא יכול**: מחוק הוצאות, נהל משתמשים, שנה הגדרות

### Viewer (צופה)
- צפייה בכל הנתונים
- חיפוש וסינון
- הורדת קבצים
- **לא יכול**: לשנות שום דבר

---

## מבנה Firestore

```
users/{uid}
  - email: string
  - displayName: string
  - role: "admin" | "editor" | "viewer"
  - isActive: boolean
  - createdAt: timestamp
  - lastLoginAt: timestamp

years/{yearId}
  - year: number (2024, 2025, 2026...)
  - totalBudget: number
  - notes: string
  - isActive: boolean
  - createdBy: string (uid)
  - createdAt: timestamp
  - updatedAt: timestamp

categories/{categoryId}
  - name: string
  - color: string (hex)
  - isActive: boolean
  - order: number
  - createdAt: timestamp

expenses/{expenseId}
  - yearId: string
  - categoryId: string
  - title: string
  - description: string
  - amount: number
  - date: timestamp
  - paidBy: string
  - paymentMethod: string
  - vendor: string
  - invoiceNumber: string
  - reimbursementStatus: "ממתין" | "הוחזר" | "לא רלוונטי"
  - reimbursementDate: timestamp | null
  - externalLink: string
  - notes: string
  - attachments: Array<{id, name, url, storagePath, uploadedAt, uploadedBy, ...}>
  - createdBy: string
  - createdByName: string
  - createdAt: timestamp
  - updatedAt: timestamp
  - updatedBy: string
  - updatedByName: string

settings/main
  - systemName: string
  - departmentName: string
  - externalLink: string
  - activeYearId: string
  - updatedAt: timestamp
  - updatedBy: string
```

---

## Firebase Storage — מבנה תיקיות

```
expenses/
  {expenseId}/
    {uniqueId}.pdf
    {uniqueId}.jpg
    ...
```

---

## פריסה לאינטרנט

### אפשרות 1: Vercel (הפשוטה ביותר)

1. צור חשבון בhttps://vercel.com
2. חבר את ה-GitHub Repository
3. הוסף את כל משתני הסביבה מ-.env.local ב-Vercel Dashboard
4. לחץ Deploy

### אפשרות 2: Firebase Hosting

```bash
# התקן Firebase CLI
npm install -g firebase-tools

# כניסה לFirebase
firebase login

# אתחול
firebase init hosting

# בנייה
npm run build

# פריסה
firebase deploy
```

### הגדרת Static Export ל-Firebase Hosting

ב-`next.config.js` הוסף:
```js
const nextConfig = {
  output: 'export',
  // ...שאר הקוד
};
```

---

## טיפים נוספים

### הוספת שנה חדשה
1. כנס כ-Admin
2. עבור ל**שנות תקציב**
3. לחץ **שנה חדשה**
4. הזן את השנה והתקציב

### ייצוא נתונים
1. כנס ל**דוחות**
2. בחר שנה
3. לחץ **CSV** או **Excel**

### גיבוי נתונים
- Firestore מבצע גיבוי אוטומטי
- ניתן לייצא מה-Firebase Console: Firestore → Export data

---

## תמיכה טכנית

לשאלות על הפרויקט:
- בדוק את הlogs ב-Firebase Console
- בדוק את ה-browser console לשגיאות
- ודא שה-.env.local מוגדר נכון
