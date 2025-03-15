# Script to add, commit and push all changes
Write-Host "Starting git operations..." -ForegroundColor Green

# Stage the modified files
Write-Host "Adding modified files..." -ForegroundColor Yellow
git add src/components/ShiftTable.js
git add docs/DataFlow/DataFlow_15-03-25.md
git add docs/extra_features.md

# Commit the changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Fix staff week assignment and add documentation

- Fix staff members appearing only in their assigned weeks
- Add extensive logging for debugging
- Create DataFlow_15-03-25.md with updated data flow diagrams
- Create extra_features.md documenting future enhancements"

# Push to the remote repository
Write-Host "Pushing to remote repository..." -ForegroundColor Yellow
git push -u origin ShiftTable_pre-export

Write-Host "Done!" -ForegroundColor Green
