'use client';

import styles from "./page.module.css";
import React from "react";
import {createStudent, getStudent} from "@/api/student";
import {useRouter} from "next/navigation";
import {Student, validate} from "@/api/type/student";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent, Divider,
  Snackbar,
  Stack, Tab, Tabs,
  TextField,
  Typography
} from "@mui/material";

function LoginCard() {
  const [id, setId] = React.useState<string>('');
  const [notFound, setNotFound] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  function login() {
    getStudent(id).then(s => {
      if (s) {
        router.push(`/${s.publicStudentId}`);
      } else {
        setNotFound(true);
      }
    });
  }

  return <Card variant="outlined" sx={{width: 600, p: 1, border: 'none'}}>
    <CardContent>
      <Stack spacing={2}>
        <Typography variant="h6">Login</Typography>
        <TextField
          label="Public Student ID"
          placeholder="e.g. S1234567"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') login();
          }}
          slotProps={{htmlInput: {maxLength: 8}}}
          helperText="Enter your publicStudentId (1–8 chars)."
          fullWidth
        />
        {notFound && (
          <Alert
            severity="warning"
            onClose={() => setNotFound(false)}
          >
            Student not found. Please check the ID or register first.
          </Alert>
        )}
      </Stack>
    </CardContent>
    <CardActions sx={{px: 2, pb: 2}}>
      <Button
        variant="contained"
        onClick={login}
        disabled={loading}
        fullWidth
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </CardActions>
  </Card>;
}

function RegisterCard() {
  const [firstName, setFirstName] = React.useState<string>('');
  const [lastName, setLastName] = React.useState<string>('');
  const [middleName, setMiddleName] = React.useState<string>('');
  const [errors, setErrors] = React.useState<Map<string, string>>(new Map());
  const [submitting, setSubmitting] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<string | null>(null);
  const router = useRouter();

  async function register() {
    const s: Student = {
      firstName: firstName.trim(),
      middleName: middleName.trim().length === 0 ? undefined : middleName.trim(),
      lastName: lastName.trim(),
      publicStudentId: '',
    };
    const validation = validate(s);
    setErrors(validation);
    if (validation.size !== 0) return;

    setSubmitting(true);
    try {
      const created = await createStudent(s);
      setSnackbar(`Welcome, ${created.firstName}! Your ID is ${created.publicStudentId}.`);
      router.push(`/${created.publicStudentId}`);
    } catch (e) {
      setSnackbar('Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return <>
    <Card variant="outlined" sx={{width: 600, p: 1, border: 'none'}}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Register</Typography>
          <Stack direction={{xs: "column", sm: "row"}} spacing={2}>
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={!!errors.get('firstName')}
              helperText={errors.get('firstName') ?? ' '}
              fullWidth
              required
            />
            <TextField
              label="Middle Name"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              error={!!errors.get('middleName')}
              helperText={errors.get('middleName') ?? ' '}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={!!errors.get('lastName')}
              helperText={errors.get('lastName') ?? ' '}
              fullWidth
              required
            />
          </Stack>
          <Alert severity="info">
            A <strong>publicStudentId</strong> (1–8 digits) will be generated automatically.
          </Alert>
        </Stack>
      </CardContent>
      <CardActions sx={{px: 2, pb: 2}}>
        <Button
          variant="contained"
          onClick={register}
          disabled={submitting}
          fullWidth
        >
          {submitting ? "Creating..." : "Create Profile"}
        </Button>
      </CardActions>
    </Card>

    <Snackbar
      open={!!snackbar}
      autoHideDuration={4000}
      onClose={() => setSnackbar(null)}
      message={snackbar ?? ''}
    />
  </>;
}

export default function Home() {
  const [tab, setTab] = React.useState<0 | 1>(0);

  return (
    <>
      <Box sx={{
        maxWidth: 720,
        mx: "auto",
        mt: 6,
        px: 2,
      }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h4" fontWeight={700}>
            Student Portal
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Create your profile or sign in with your <em>publicStudentId</em>.
          </Typography>

          <Card variant="outlined" sx={{width: '100%'}}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              aria-label="login or register"
            >
              <Tab label="Login"/>
              <Tab label="Register"/>
            </Tabs>
            <Divider/>
            <Box sx={{p: 3, display: 'flex', justifyContent: 'center'}}>
              {tab === 0 ? <LoginCard/> : <RegisterCard/>}
            </Box>
          </Card>
        </Stack>
      </Box>
    </>
  );
}
