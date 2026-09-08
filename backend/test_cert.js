const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const buildCertificatePDF = async (doc, user, itemTitle, itemId, isInternship, purchaseDate, issuedDate) => {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    const formatDate = (dt) =>
        dt
            ? new Date(dt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
            : 'N/A';

    // 1. Background and Borders
    doc.rect(0, 0, pageWidth, pageHeight).fill('#FDFBF7');

    // Helper for inverted rounded corners
    function drawInvertedRect(doc, x, y, w, h, r) {
        const k = 0.552284749831;
        doc.moveTo(x + r, y)
           .lineTo(x + w - r, y)
           .bezierCurveTo(x + w - r, y + r * k, x + w - r * k, y + r, x + w, y + r)
           .lineTo(x + w, y + h - r)
           .bezierCurveTo(x + w - r * k, y + h - r, x + w - r, y + h - r * k, x + w - r, y + h)
           .lineTo(x + r, y + h)
           .bezierCurveTo(x + r, y + h - r * k, x + r * k, y + h - r, x, y + h - r)
           .lineTo(x, y + r)
           .bezierCurveTo(x + r * k, y + r, x + r, y + r * k, x + r, y)
           .closePath();
    }

    // Inner Border (Gold/Orange)
    drawInvertedRect(doc, 30, 30, pageWidth - 60, pageHeight - 60, 40);
    doc.lineWidth(1).stroke('#F59E0B');

    // Outer Border (Thin Navy)
    drawInvertedRect(doc, 20, 20, pageWidth - 40, pageHeight - 40, 40);
    doc.lineWidth(1).stroke('#003366');

    // Top-Left Corner Accent
    doc.polygon([0, 0], [180, 0], [0, 180]).fill('#003366'); // main navy triangle
    doc.moveTo(190, 0).lineTo(0, 190).lineWidth(2).stroke('#F59E0B'); // gold diagonal
    doc.moveTo(196, 0).lineTo(0, 196).lineWidth(1).stroke('#003366'); // thin navy diagonal

    // Bottom-Right Corner Accent
    doc.polygon([pageWidth, pageHeight], [pageWidth - 180, pageHeight], [pageWidth, pageHeight - 180]).fill('#003366');
    doc.moveTo(pageWidth - 190, pageHeight).lineTo(pageWidth, pageHeight - 190).lineWidth(2).stroke('#F59E0B');
    doc.moveTo(pageWidth - 196, pageHeight).lineTo(pageWidth, pageHeight - 196).lineWidth(1).stroke('#003366');
    
    // Reset opacity
    doc.strokeOpacity(1);

    // 2. Logo
    const logoPath = path.join(__dirname, '../frontend/public/logo1.png');
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, (pageWidth - 140) / 2, 70, {
            width: 140,
            align: 'center'
        });
    }

    // 3. CERTIFICATE OF COMPLETION
    doc.font('Times-Bold')
       .fontSize(32)
       .fillColor('#003366')
       .text('CERTIFICATE', 0, 130, { align: 'center', characterSpacing: 5 });
    
    doc.font('Times-Bold')
       .fontSize(16)
       .text('OF COMPLETION', 0, 165, { align: 'center', characterSpacing: 3 });

    // 4. RECIPIENT
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#666666')
       .text('THIS CERTIFICATE IS PROUDLY PRESENTED TO', 0, 220, { align: 'center', characterSpacing: 1 });

    const studentName = user.fullName || 'Student Name';
    doc.font('Times-Italic')
       .fontSize(42)
       .fillColor('#003366')
       .text(studentName, 0, 245, { align: 'center' });
       
    // Orange underline for the name
    const nameWidth = doc.widthOfString(studentName);
    const underlineX = (pageWidth - nameWidth) / 2 - 20;
    doc.moveTo(underlineX, 295)
       .lineTo(underlineX + nameWidth + 40, 295)
       .lineWidth(1.5)
       .stroke('#F59E0B');

    // 5. PROGRAM
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor('#666666')
       .text('FOR SUCCESSFULLY COMPLETING', 0, 325, { align: 'center', characterSpacing: 1 });

    let displayTitle = itemTitle || 'Program Name';
    const titleType = isInternship ? 'Internship' : 'Course';
    if (!displayTitle.toLowerCase().includes(titleType.toLowerCase())) {
        displayTitle = `${displayTitle} ${titleType}`;
    }

    doc.font('Times-Bold');
    let titleFontSize = 24;
    doc.fontSize(titleFontSize);
    const maxTitleWidth = pageWidth - 140;
    
    while (doc.widthOfString(displayTitle) > maxTitleWidth && titleFontSize > 12) {
        titleFontSize -= 1;
        doc.fontSize(titleFontSize);
    }

    doc.fillColor('#003366')
       .text(displayTitle, 70, 350 + (24 - titleFontSize)/2, { align: 'center', width: maxTitleWidth });

    const typeStr = isInternship ? 'internship' : 'course';
    const descText = isInternship 
        ? `This certificate recognizes the successful completion of the ${itemTitle || 'program'} internship, demonstrating practical learning, professional development, and applied technical skills.`
        : `This certificate recognizes the successful completion of the ${itemTitle || 'program'} course, demonstrating commitment to professional learning and technical skill development.`;

    doc.font('Helvetica')
       .fontSize(11)
       .fillColor('#4B5563')
       .text(descText, 100, 395, { align: 'center', width: pageWidth - 200, lineGap: 3 });

    // 6. METADATA COLUMNS & STAMPS
    const footerY = 445;
    
    const fromDate = purchaseDate ? formatDate(purchaseDate) : formatDate(user.createdAt || issuedDate);
    const toDate = formatDate(issuedDate);
    const durationText = `${fromDate} - ${toDate}`;
    
    const userIdPart = user._id.toString().slice(-6).toUpperCase();
    const itemIdPart = itemId.toString().slice(-6).toUpperCase();
    const certificateId = isInternship ? `IK-INT-${userIdPart}-${itemIdPart}` : `IK-${userIdPart}-${itemIdPart}`;

    // Column 1: Duration & InternKatta Stamp
    const col1X = 90;
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#9CA3AF').text(`${typeStr.toUpperCase()} DURATION`, col1X, footerY, { characterSpacing: 1, align: 'center', width: 160 });
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#003366').text(durationText, col1X, footerY + 12, { align: 'center', width: 160 });

    const bottomRowCenterY = 502; // Center alignment for bottom elements
    const stampImagePath = path.join(__dirname, '../frontend/public/Internkatta_stamp.png');
    if (fs.existsSync(stampImagePath)) {
        const stampSize = 62;
        const stampX = col1X + (160 - stampSize)/2 - 5; // move left to cover artifact
        const stampY = bottomRowCenterY - (stampSize / 2) + 2; // slight tweak to cover completely
        
        doc.image(stampImagePath, stampX, stampY, {
            fit: [stampSize, stampSize],
            align: 'center',
            valign: 'center'
        });
    }

    // Column 2: Issued Date & ISO Mark
    const col2X = (pageWidth - 160) / 2;
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#9CA3AF').text('ISSUED DATE', col2X, footerY, { characterSpacing: 1, align: 'center', width: 160 });
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#003366').text(formatDate(issuedDate), col2X, footerY + 12, { align: 'center', width: 160 });

    const isoImagePath = path.join(__dirname, '../frontend/public/ISO_Stamp.png');
    if (fs.existsSync(isoImagePath)) {
        const isoSize = 62;
        const isoX = col2X + (160 - isoSize)/2;
        const isoY = bottomRowCenterY - (isoSize / 2);
        doc.image(isoImagePath, isoX, isoY, {
            fit: [isoSize, isoSize],
            align: 'center',
            valign: 'center'
        });
    }

    // Column 3: Certificate ID & QR Code
    const col3X = pageWidth - 250;
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#9CA3AF').text('CERTIFICATE ID', col3X, footerY, { characterSpacing: 1, align: 'center', width: 160 });
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#003366').text(certificateId, col3X, footerY + 12, { align: 'center', width: 160 });

    const verifyUrl = `https://internkatta.com/verify-certificate/${certificateId}`;
    try {
        const qrCodeBuffer = await QRCode.toBuffer(verifyUrl, {
            errorCorrectionLevel: 'M',
            type: 'png',
            margin: 1
        });
        const qrSize = 62;
        const qrX = col3X + (160 - qrSize)/2;
        const qrY = bottomRowCenterY - (qrSize / 2);
        doc.image(qrCodeBuffer, qrX, qrY, { width: qrSize });
        
        doc.font('Helvetica-Bold')
           .fontSize(7)
           .fillColor('#003366')
           .text('VERIFY', col3X, qrY + qrSize + 4, { align: 'center', width: 160, characterSpacing: 1 });
    } catch (err) {
        console.error('QR Code generation failed:', err);
    }
};

const run = async () => {
    const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    
    doc.pipe(fs.createWriteStream('test_cert.pdf'));
    
    const mockUser = {
        _id: '123456789012345678901234',
        fullName: 'John Doe',
        createdAt: new Date('2023-01-01')
    };
    
    const itemTitle = "Artificial Intelligence and Machine Learning";
    const isInternship = true;
    await buildCertificatePDF(
        doc, 
        mockUser, 
        itemTitle, 
        '987654321098765432109876', 
        isInternship, 
        new Date('2023-01-01'), 
        new Date('2023-12-01')
    );
    
    doc.end();
    console.log('Generated test_cert.pdf');
}

run();
