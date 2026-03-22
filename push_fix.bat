SET PATH=%PATH%;C:\Program Files\Git\cmd
git add src/auth.ts
git commit -m "fix: remove file system logging to prevent cloud deployment crash"
git push origin main
