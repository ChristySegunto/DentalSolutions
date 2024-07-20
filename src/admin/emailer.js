const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');




const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


// Configure Nodemailer with your email provider (e.g., Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'process.env.EMAIL_USER,',
        pass: 'process.env.EMAIL_PASS'
    }
});

exports.handler = async (event) => {
    try {
        // Fetch patient IDs
        const { data: patientIdsData, error: patientIdsError } = await supabase
            .from('patient')
            .select('patient_id');

        if (patientIdsError) {
            throw new Error('Error fetching patient IDs: ' + patientIdsError.message);
        }

        const patientIds = patientIdsData.map(patient => patient.patient_id);

        // Fetch treatment details for all patient IDs
        const { data: treatments, error: treatmentError } = await supabase
            .from('patient_Treatments')
            .select('patient_id, treatment_nextvisit')
            .in('patient_id', patientIds);

        if (treatmentError) {
            throw new Error('Error fetching treatments: ' + treatmentError.message);
        }

        // Process treatments and send reminders
        const today = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
        const twoDaysBefore = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Two days before today

        // Filter treatments for today's and two days before visits
        const todayTreatments = treatments.filter(treatment => treatment.treatment_nextvisit === today);
        const twoDaysBeforeTreatments = treatments.filter(treatment => treatment.treatment_nextvisit === twoDaysBefore);

        // Send reminders for treatments
        const reminders = [];

        todayTreatments.forEach(treatment => {
            reminders.push(sendReminderEmail(treatment.patient_id, 'today', treatment.treatment_nextvisit));
        });

        twoDaysBeforeTreatments.forEach(treatment => {
            reminders.push(sendReminderEmail(treatment.patient_id, 'two days before', treatment.treatment_nextvisit));
        });

        await Promise.all(reminders);

        return {
            statusCode: 200,
            body: JSON.stringify('Reminders sent successfully')
        };
    } catch (error) {
        console.error('Error processing reminders:', error);
        return {
            statusCode: 500,
            body: JSON.stringify('Error processing reminders')
        };
    }
};

async function sendReminderEmail(patientId, reminderType, visitDate) {
    try {
        // Fetch patient details from patient_id
        const { data: patientData, error: patientError } = await supabase
            .from('patient')
            .select('patient_fname', 'patient_email')
            .eq('patient_id', patientId)
            .single();

        if (patientError) {
            throw new Error(`Error fetching patient details for patient ID ${patientId}: ` + patientError.message);
        }

        const { patient_fname, patient_email } = patientData;

        // Prepare email content based on reminderType
        let subject, text;
        if (reminderType === 'today') {
            subject = `Reminder: Your Appointment Today`;
            text = `Dear ${patient_fname},\n\nThis is a reminder that you have an appointment scheduled for today, ${visitDate} at Dental Solutions.\n\nBest regards,\nDental Solutions`;
        } else if (reminderType === 'two days before') {
            subject = `Reminder: Your Appointment in 2 Days`;
            text = `Dear ${patient_fname},\n\nThis is a reminder that you have an appointment scheduled in 2 days, on ${visitDate} at Dental Solutions.\n\nBest regards,\nDental Solutions`;
        } else {
            throw new Error(`Invalid reminder type: ${reminderType}`);
        }

        // Prepare email options
        const mailOptions = {
            from: 'dentalsolutionsample@gmail.com',
            to: patient_email,
            subject: subject,
            text: text
        };

        // Send email
        await transporter.sendMail(mailOptions);

        console.log(`Reminder email sent to ${patient_email} for appointment ${reminderType} on ${visitDate}`);

    } catch (error) {
        console.error(`Error sending ${reminderType} reminder email to patient ID ${patientId}:`, error);
        throw error; 
    }
}


