const mongoose = require('mongoose');
const User = require('./models/userModel');
const Internship = require('./models/internshipModel');
const fs = require('fs');

async function test() {
    try {
        const userId = "694a6314decd34ffb04e95e1";
        const internshipId = "692819b79f897aa84c08f651";

        const user = await User.findById(userId).select('fullName email internshipProgress');
        const internship = await Internship.findById(internshipId).select('title lectures');

        const matchingProgresses = (user.internshipProgress || []).filter(p => p.internshipId && p.internshipId.toString() === internshipId);
        
        let log = `TEST SCRIPT OUTPUT:\n`;
        log += `User found: ${!!user}\n`;
        log += `Internship found: ${!!internship}\n`;
        log += `Total internshipProgress entries: ${(user.internshipProgress || []).length}\n`;
        log += `Matching entries: ${matchingProgresses.length}\n`;
        
        if (matchingProgresses.length > 0) {
            const progress = matchingProgresses[matchingProgresses.length - 1];
            log += `Last match completedLectures length: ${progress.completedLectures?.length}\n`;
            
            const statuses = progress.completedLectures.map(l => l.status);
            log += `Statuses: ${JSON.stringify(statuses)}\n`;
        }

        // What does getInternshipLearningAnalytics see?
        const users = await User.find({ _id: userId })
            .populate('enrolledInternships', 'title lectures')
            .populate('internshipProgress.internshipId', 'title lectures');
        
        if (users.length > 0) {
            const progressByInternship = new Map(
                (users[0].internshipProgress || []).map((progress) => [
                    progress.internshipId?._id?.toString() || progress.internshipId?.toString(),
                    progress
                ])
            );
            const p = progressByInternship.get(internshipId);
            log += `Analytics progress completedLectures length: ${p?.completedLectures?.length}\n`;
            if (p) {
                log += `Analytics Statuses: ${JSON.stringify(p.completedLectures.map(l => l.status))}\n`;
            }
        }

        fs.appendFileSync('test_debug.log', log + '\n------------------\n');
        console.log("Test script finished, wrote to test_debug.log");
    } catch (err) {
        fs.appendFileSync('test_debug.log', `Error: ${err.message}\n`);
    }
}

test();
