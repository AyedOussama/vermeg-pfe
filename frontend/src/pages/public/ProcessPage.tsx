import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useTheme,
  alpha
} from '@mui/material';
import {
  Work as WorkIcon,
  Quiz as QuizIcon,
  People as PeopleIcon,
  Approval as ApprovalIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

const ProcessPage: React.FC = () => {
  const theme = useTheme();

  const processSteps = [
    {
      label: 'Job Creation & Technical Assessment',
      description: 'Project Leader creates job requirements and technical quiz',
      details: [
        'Project Leader defines job requirements and responsibilities',
        'Creates technical assessment quiz (8-10 targeted questions)',
        'Sets qualification criteria and experience requirements',
        'Job package automatically routed to HR for enhancement'
      ],
      icon: <WorkIcon />,
      color: '#64748b'
    },
    {
      label: 'HR Enhancement & Behavioral Assessment',
      description: 'HR adds behavioral evaluation and cultural fit assessment',
      details: [
        'HR receives pending job package with technical components',
        'Adds behavioral assessment questions and cultural fit evaluations',
        'Defines HR-specific evaluation criteria and scoring',
        'Enhanced job package forwarded to CEO for final approval'
      ],
      icon: <PeopleIcon />,
      color: '#f59e0b'
    },
    {
      label: 'Executive Approval & Publication',
      description: 'CEO reviews and approves job for publication',
      details: [
        'CEO reviews complete job package (technical + HR components)',
        'Approves publication or requests specific modifications',
        'Approved jobs become publicly visible on platform',
        'Automated notifications sent to relevant stakeholders'
      ],
      icon: <ApprovalIcon />,
      color: '#6366f1'
    },
    {
      label: 'Candidate Application & Assessment',
      description: 'Candidates apply and complete sequential assessments',
      details: [
        'Candidate discovers and applies for published positions',
        'Completes sequential assessment: Technical Quiz → HR Quiz',
        'Comprehensive results compiled and delivered to Project Leader',
        'Project Leader makes hiring decision and candidate receives notification'
      ],
      icon: <AssignmentIcon />,
      color: '#2563eb'
    }
  ];

  const benefits = [
    {
      title: 'Streamlined Workflow',
      description: '50% reduction in time-to-hire with automated process management',
      icon: <SpeedIcon />,
      color: '#10b981'
    },
    {
      title: 'Quality Assurance',
      description: 'Multi-stage approval ensures high-quality job postings',
      icon: <CheckCircleIcon />,
      color: '#8b5cf6'
    },
    {
      title: 'Comprehensive Assessment',
      description: 'Technical and behavioral evaluation for complete candidate profile',
      icon: <QuizIcon />,
      color: '#f59e0b'
    },
    {
      title: 'Transparent Timeline',
      description: 'Clear expectations and milestones for all stakeholders',
      icon: <TimelineIcon />,
      color: '#ef4444'
    }
  ];

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3
            }}
          >
            Our Recruitment Process
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}
          >
            A comprehensive, role-based workflow that ensures quality hiring through 
            collaborative assessment and streamlined approval processes.
          </Typography>
        </Box>

        {/* Process Steps */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 8,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 3
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
            Step-by-Step Workflow
          </Typography>
          
          <Stepper orientation="vertical" sx={{ '& .MuiStepConnector-line': { minHeight: 60 } }}>
            {processSteps.map((step, index) => (
              <Step key={index} active={true}>
                <StepLabel
                  StepIconComponent={() => (
                    <Avatar
                      sx={{
                        bgcolor: step.color,
                        width: 48,
                        height: 48,
                        color: 'white',
                        boxShadow: `0 4px 12px ${alpha(step.color, 0.3)}`
                      }}
                    >
                      {step.icon}
                    </Avatar>
                  )}
                >
                  <Typography variant="h6" fontWeight={600} sx={{ color: step.color }}>
                    {step.label}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                    {step.description}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ ml: 2, mt: 2 }}>
                    {step.details.map((detail, detailIndex) => (
                      <Typography
                        key={detailIndex}
                        variant="body2"
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          mb: 1,
                          '&:before': {
                            content: '"•"',
                            color: step.color,
                            fontWeight: 'bold',
                            width: '1em',
                            marginRight: '0.5em'
                          }
                        }}
                      >
                        {detail}
                      </Typography>
                    ))}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Benefits Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
            Process Benefits
          </Typography>
          <Grid container spacing={3}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 24px ${alpha(benefit.color, 0.2)}`
                    }
                  }}
                >
                  <CardContent>
                    <Avatar
                      sx={{
                        bgcolor: benefit.color,
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2,
                        boxShadow: `0 4px 12px ${alpha(benefit.color, 0.3)}`
                      }}
                    >
                      {benefit.icon}
                    </Avatar>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Timeline Expectations */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: alpha(theme.palette.success.main, 0.02),
            border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
            borderRadius: 3
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
            Timeline Expectations
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="success.main" fontWeight={700}>
                  2-3 Days
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Job Creation to Publication
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  From initial job creation by Project Leader through HR enhancement to CEO approval
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary.main" fontWeight={700}>
                  1-2 Hours
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Candidate Assessment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete technical and HR assessment process for thorough evaluation
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main" fontWeight={700}>
                  1-2 Days
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Decision & Notification
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Project Leader review and final hiring decision with automated candidate notification
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProcessPage;
