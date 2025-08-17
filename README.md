# Shopify Complete Integration (Free-friendly)

קבצים אלו מספקים חיבור ראשוני ל-Shopify כולל צ'אט פשוט ו-endpoints לניהול מוצרים והזמנות.

## מה יש בחבילה
- `server.js` — שרת Express עם endpoints: `/api/products`, `/api/orders`, `/api/chat`, `/webhook`
- `public/chat-widget.js` — סקריפט צ'אט קל להטמעה
- `dashboard/index.html` — דשבורד בסיסי לבדיקת חיבור
- `package.json`, `Procfile`, `.env.example`

## הוראות מהירות (Render)
1. הורד ופתח את ה-ZIP בתיקייה מקומית.
2. העלה ל-Render (New → Web Service → Upload .zip) או העלה לריפו GitHub ו-connect.
3. ב-Environment variables (Config): הוסף את הערכים הבאים:
   - SHOPIFY_API_KEY
   - SHOPIFY_API_SECRET
   - SHOPIFY_ACCESS_TOKEN
   - SHOPIFY_STORE
   - OPENAI_API_KEY (אופציונלי - אם רוצים שהצ'אט ישתמש ב-OpenAI)
4. Build command: `npm install`
   Start command: `npm start`
5. אחרי שהשרת רץ — העתק את URL שניתן על ידי Render והחלף את הכתובת בסקריפט `public/chat-widget.js` במקום `REPLACE_WITH_YOUR_SERVER` וכנס ל-Shopify → Online Store → Themes → Edit code או Script Tags והוסף `<script src="https://YOUR_RENDER_URL/public/chat-widget.js"></script>`

## אבטחה חשובה
- מי שמחזיק ב-`SHOPIFY_ACCESS_TOKEN` יכול לבצע פעולות בחנות. אם הסוד נחשף — בטל (revoke) וגלש מפתח חדש ב-Shopify.
- מומלץ לשים `OPENAI_API_KEY` אם רוצים מענה חזק והגדר תשלומים בהתאם ב-OpenAI.

## הערה
הקבצים הם נקודת תחילה — אשמח לעזור לך להרחיב את היכולות (העברת שיחות לנציגים, התאמה אישית של תגובות, שיפור עיצוב ה-widget ועוד).
