'use client';

import {Student, validate} from "@/api/type/student";
import React, {useEffect} from "react";
import {getStudent, updateStudent} from "@/api/student";
import {useRouter} from "next/navigation";
import {EnrollmentPublic} from "@/api/type/enrollment";
import {Course} from "@/api/type/course";
import {drop, enroll, listEnrolled} from "@/api/enrollment";
import {listEnabledCourses} from "@/api/course";

import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Stack,
  TextField,
  Button,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";

export interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Show enrolled courses and allow enrolling/dropping
 */
function Enrollment(props: Props) {
  const [enrolled, setEnrolled] = React.useState<(Course & EnrollmentPublic)[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [selecting, setSelecting] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const {id} = React.use(props.params);

  useEffect(() => {
    setLoading(true);
    Promise.all([listEnrolled(id), listEnabledCourses()])
      .then(([enrolledList, allCourses]) => {
        setEnrolled(enrolledList);
        setCourses(allCourses);
      })
      .catch(() => setErr("Failed to load courses"))
      .finally(() => setLoading(false));
  }, [id]);

  const enrolledIds = new Set(enrolled.map(e => e.publicCourseId));
  const available = courses.filter(c => !enrolledIds.has(c.publicCourseId));

  async function enrollAction(courseId: string) {
    if (!courseId) return;
    setBusy(true);
    setErr(null);
    try {
      const e = await enroll(id, courseId);
      setEnrolled(prev => [...prev, e]);
      setSelecting("");
      setMsg(`Enrolled: ${e.publicCourseId}`);
    } catch (e) {
      setErr("Enroll failed: " + e);
    } finally {
      setBusy(false);
    }
  }

  async function dropAction(courseId: string) {
    setBusy(true);
    setErr(null);
    try {
      await drop(id, courseId);
      setEnrolled(prev => prev.filter(e => e.publicCourseId !== courseId));
      setMsg(`Dropped: ${courseId}`);
    } catch (e) {
      setErr("Drop failed: " + e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">My Courses</Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress/>
            </Box>
          ) : (
            <>
              {err && <Alert severity="error" onClose={() => setErr(null)}>{err}</Alert>}

              <Stack direction={{xs: "column", sm: "row"}} spacing={2} alignItems="center">
                <FormControl sx={{minWidth: 260}}>
                  <InputLabel id="enroll-course-label">Select Course to Enroll</InputLabel>
                  <Select labelId="enroll-course-label"
                          label="Select Course to Enroll"
                          value={selecting}
                          onChange={(e) => setSelecting(e.target.value)}
                          disabled={busy || available.length === 0}
                          variant="outlined">
                    {available.map(c => (
                      <MenuItem key={c.publicCourseId} value={c.publicCourseId}>
                        {c.publicCourseId} — {c.courseName} ({c.semester} {c.year})
                      </MenuItem>
                    ))}
                    {available.length === 0 && (
                      <MenuItem value="" disabled>No more available courses</MenuItem>
                    )}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  disabled={!selecting || busy}
                  onClick={() => enrollAction(selecting)}
                >
                  {busy ? "Processing..." : "Enroll"}
                </Button>
              </Stack>

              <Divider/>

              <Table size="small" aria-label="enrolled courses">
                <TableHead>
                  <TableRow>
                    <TableCell>Course ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Semester</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>GPA</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrolled.map(e => (
                    <TableRow key={e.publicCourseId} hover>
                      <TableCell>
                        <Chip size="small" label={e.publicCourseId}/>
                      </TableCell>
                      <TableCell>{e.courseName}</TableCell>
                      <TableCell>{e.semester}</TableCell>
                      <TableCell>{e.year}</TableCell>
                      <TableCell>{e.GPA ?? "0.00"}</TableCell>
                      <TableCell align="right">
                        <Button
                          color="error"
                          size="small"
                          disabled={busy}
                          onClick={() => dropAction(e.publicCourseId)}
                        >
                          Drop
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {enrolled.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography color="text.secondary">You have not enrolled in any course yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </Stack>
      </CardContent>
      <Snackbar
        open={!!msg}
        autoHideDuration={3000}
        onClose={() => setMsg(null)}
        message={msg ?? ""}
      />
    </>
  );
}

/**
 * Display and edit student profile
 */
function Profile(props: Props) {
  const [student, setStudent] = React.useState<Student | undefined>();
  const [errors, setErrors] = React.useState<Map<string, string>>(new Map());
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const router = useRouter();
  const {id} = React.use(props.params);

  useEffect(() => {
    setLoading(true);
    getStudent(id)
      .then(s => {
        if (s) setStudent(s);
        else router.push('/');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function update() {
    if (!student) return;
    const validation = validate(student);
    if (validation.size !== 0) {
      setErrors(validation);
      return;
    }
    setSaving(true);
    try {
      await updateStudent(student);
      setMsg("Profile updated.");
      setErrors(new Map());
    } catch (e) {
      setMsg("Update failed: " + e);
    } finally {
      setSaving(false);
    }
  }

  const getError = (k: string) => errors.get(k);

  return (
    <>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Profile: {student?.publicStudentId}</Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress/>
            </Box>
          ) : student ? (
            <>
              <Stack direction={{xs: "column", sm: "row"}} spacing={2}>
                <TextField
                  label="First Name"
                  value={student.firstName}
                  onChange={(e) => setStudent({...student, firstName: e.target.value})}
                  error={!!getError('firstName')}
                  helperText={getError('firstName') ?? ' '}
                  fullWidth
                />
                <TextField
                  label="Middle Name (optional)"
                  value={student.middleName ?? ''}
                  onChange={(e) => setStudent({...student, middleName: e.target.value || undefined})}
                  error={!!getError('middleName')}
                  helperText={getError('middleName') ?? ' '}
                  fullWidth
                />
                <TextField
                  label="Last Name"
                  value={student.lastName}
                  onChange={(e) => setStudent({...student, lastName: e.target.value})}
                  error={!!getError('lastName')}
                  helperText={getError('lastName') ?? ' '}
                  fullWidth
                />
              </Stack>
            </>
          ) : (
            <Alert severity="warning">Student not found.</Alert>
          )}
        </Stack>
      </CardContent>
      <CardActions sx={{px: 2, pb: 2}}>
        <Button variant="contained" onClick={update} disabled={saving || !student}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button color="inherit" onClick={() => router.push("/")}>Back Home</Button>
      </CardActions>
      <Snackbar
        open={!!msg}
        autoHideDuration={3000}
        onClose={() => setMsg(null)}
        message={msg ?? ""}
      />
    </>
  );
}

export default function StudentPage(props: Props) {
  const [tab, setTab] = React.useState<'profile' | 'enrollment'>('profile');

  return (
    <>
      <Typography variant="h4" fontWeight={700}>
        Student Center
      </Typography>

      <Tabs
        value={tab === 'profile' ? 0 : 1}
        onChange={(_, v) => setTab(v === 0 ? 'profile' : 'enrollment')}
        variant="standard"
        aria-label="Profile or Enrollment"
      >
        <Tab label="Profile"/>
        <Tab label="Enrollment"/>
      </Tabs>
      <Divider/>
      <Box sx={{p: 3}}>
        {tab === 'profile'
          ? <Profile {...props} />
          : <Enrollment {...props} />}
      </Box>
    </>
  );
}
