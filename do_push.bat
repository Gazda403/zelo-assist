SET PATH=%PATH%;C:\Program Files\Git\cmd
git init
git config --global user.email "agent@example.com"
git config --global user.name "Antigravity Agent"
git remote remove origin 2>nul
git remote add origin https://github.com/Gazda403/zelo-assist.git
git add .
git commit -m "feat: Add full app assets and structure including UI models"
git branch -M main
git push -u origin main --force
