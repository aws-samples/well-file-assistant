import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function Home() {
  return (
    <Box className="gradient-bg flex min-h-screen flex-col items-center justify-center p-8">
      <Card className="max-w-2xl w-full hover-effect">
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Well File Assistant Demo
          </Typography>
          <Typography variant="body1">
            Check out the Chat tab to create tables from PDF files. This demo comes with sample data for a well with API number 30-039-07715. Tell it to make a table based on PDF files from a well. Specify the well&apos;s API number, and which columns you&apos;re looking for in the table.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Example:
          </Typography>
          <Typography variant="body1">
            &quot;I&apos;m making an operational history for a well with API number 30-039-07715. The history should show events like drilling the well, completing a zone, repairing artificial lift, and other events which impact the wellbore. Make a table showing the type of operation, text from the report describing operational details, and document title. Exclude information about changes in transporter or cathotic protection.&quot;
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
