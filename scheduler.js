const cron = require('node-cron');
const twilio = require('twilio');  // Ensure twilio is imported correctly
const { createClient } = require('@supabase/supabase-js');
const { format, addHours } = require('date-fns');
const Mailjet = require('node-mailjet');

// Initialize Supabase client
const SUPABASE_URL = 'https://riiivtteehdejjcxvyau.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaWl2dHRlZWhkZWpqY3h2eWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgyNDA3NjAsImV4cCI6MjAzMzgxNjc2MH0.JH-AYOgZXvVZ71Wv-JZ2h5ajeRsk_pF3-DRWPPawGO4';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialize Mailjet client
const mailjet = Mailjet.apiConnect(
    '9ac7d66041066e6d01e6fed821436b62',
    '162183617aa57f633f75b8234a5cc0e1'
);


// Initialize Twilio client
const accountSid = 'AC0cea4aed596d44fa07d5c8b64219c90d';
const authToken = '1d4c27a196e4cbf480887aec4ecbefd8';
const twilioClient = twilio(accountSid, authToken);

// Timezone offset for Philippines (UTC+8)
const TIMEZONE_OFFSET_HOURS = 8;

function formatDate(date) {
    return format(date, 'yyyy-MM-dd');
}

const sendEmails = async () => {
    try {
        // Calculate today's date in Philippines timezone
        const today = addHours(new Date(), TIMEZONE_OFFSET_HOURS);
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

        const formattedStartOfToday = formatDate(startOfToday);
        const formattedEndOfToday = formatDate(endOfToday);

        // Calculate the date two days before today
        const twoDaysBefore = addHours(new Date(), TIMEZONE_OFFSET_HOURS);
        twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);
        const startOfTwoDaysBefore = new Date(twoDaysBefore.getFullYear(), twoDaysBefore.getMonth(), twoDaysBefore.getDate());
        const endOfTwoDaysBefore = new Date(twoDaysBefore.getFullYear(), twoDaysBefore.getMonth(), twoDaysBefore.getDate(), 23, 59, 59, 999);

        const formattedStartOfTwoDaysBefore = formatDate(startOfTwoDaysBefore);
        const formattedEndOfTwoDaysBefore = formatDate(endOfTwoDaysBefore);

        const { data: todayData, error: todayError } = await supabase
            .from('patient_Treatments')
            .select('*')
            .gte('treatment_nextvisit', formattedStartOfToday)
            .lte('treatment_nextvisit', formattedEndOfToday);

        const { data: twoDaysBeforeData, error: twoDaysBeforeError } = await supabase
            .from('patient_Treatments')
            .select('*')
            .gte('treatment_nextvisit', formattedStartOfTwoDaysBefore)
            .lte('treatment_nextvisit', formattedEndOfTwoDaysBefore);

        if (todayError || twoDaysBeforeError) {
            console.error('Error querying Supabase:', todayError || twoDaysBeforeError);
            return;
        }

        const combinedData = [...todayData, ...twoDaysBeforeData];

        for (const treatment of combinedData) {
            const { data: patient, error: patientError } = await supabase
                .from('patient')
                .select('*')
                .eq('patient_id', treatment.patient_id)
                .single();

            if (patientError) {
                console.error(`Error fetching patient with ID ${treatment.patient_id}:`, patientError);
                continue;
            }

            if (!patient.patient_email) {
                console.log(`Patient with ID ${treatment.patient_id} does not have an email address.`);
                continue;
            }

            const templateParams = {
                send_to: patient.patient_email,
                to_name: patient.patient_fname,
                treatment: treatment.treatment,
                treatment_type: treatment.treatment_type,
                treatment_date: treatment.treatment_date,
            };

            if (treatment.emailed === null) {
                const messageDate = treatment.treatment_nextvisit === formattedStartOfToday ? "today" : "in 2 days";
                console.log(`Sending email to ${patient.patient_email}...`);
                try {
                    const emailResult = await mailjet
                        .post('send', { version: 'v3.1' })
                        .request({
                            Messages: [
                                {
                                    From: {
                                        Email: 'dentalsolutionsample@gmail.com',
                                        Name: 'Dental Solutions'
                                    },
                                    To: [
                                        {
                                            Email: patient.patient_email,
                                            Name: patient.patient_fname
                                        }
                                    ],
                                    Subject: 'Dental Solutions - next visit reminder',
                                    TextPart: `Dear ${patient.patient_fname}, this is a reminder for your next visit on ${messageDate}.`,
                                    HTMLPart: `<h3>Dear ${patient.patient_fname},</h3><p>This is a reminder for your next visit on ${messageDate}.</p>`
                                }
                            ]
                        });

                    console.log('Email sent:', emailResult.body);

                    const { error: updateError } = await supabase
                        .from('patient_Treatments')
                        .update({ emailed: true })
                        .eq('treatment_id', treatment.treatment_id);

                    if (updateError) {
                        console.error(`Error updating emailed status for treatment ID ${treatment.treatment_id}:`, updateError);
                    } else {
                        console.log(`Email sent and status updated for treatment ID ${treatment.treatment_id}.`);
                    }

                } catch (error) {
                    console.error('Error sending email:', error);
                }

            } else {
                console.log(`Email already sent for treatment ID ${treatment.treatment_id}.`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
};




// Schedule the function to run every minute
cron.schedule('* * * * *', () => {
    console.log('Running scheduled task...');
    sendEmails();
});
