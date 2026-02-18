import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";
import { Snackbar, Typography } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#FF9839",
    },
  },
});

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [bgImage, setBgImage] = React.useState("");

  const { handleRegister, handleLogin } =
    React.useContext(AuthContext);

  // 🔥 Curated high-quality backgrounds
  const images = [
    "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0",
    "https://images.unsplash.com/photo-1593642532973-d31b6557fa68",
  ];

  React.useEffect(() => {
    const randomIndex = Math.floor(Math.random() * images.length);
    setBgImage(
      `${images[randomIndex]}?auto=format&fit=crop&w=1600&q=80`
    );
  }, []);

  const handleAuth = async () => {
    try {
      setError("");

      if (!username || !password) {
        setError("Username and password are required");
        return;
      }

      if (formState === 0) {
        await handleLogin(username, password);
      }

      if (formState === 1) {
        if (!name) {
          setError("Full name is required");
          return;
        }

        const result = await handleRegister(
          name,
          username,
          password
        );

        setUsername("");
        setPassword("");
        setName("");
        setMessage(result || "Registration successful");
        setOpen(true);
        setFormState(0);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Something went wrong";
      setError(msg);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />

        {/* 🔥 Background Side */}
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            position: "relative",
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay for premium look */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55))",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              bottom: 40,
              left: 40,
              color: "white",
              maxWidth: 400,
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              Meet without limits
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Real-time conversations. Simple, secure, seamless.
            </Typography>
          </Box>
        </Grid>

        {/* 🔥 Auth Panel */}
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={10}
        >
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: 6,
            }}
          >
            <Box textAlign="center">
              <Avatar
                sx={{ m: "0 auto 16px", bgcolor: "primary.main" }}
              >
                <LockOutlinedIcon />
              </Avatar>

              <Typography variant="h5" fontWeight="bold">
                {formState === 0 ? "Welcome Back" : "Create Account"}
              </Typography>
            </Box>

            {/* Toggle Buttons */}
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                fullWidth
                variant={formState === 0 ? "contained" : "outlined"}
                onClick={() => setFormState(0)}
              >
                Sign In
              </Button>

              <Button
                fullWidth
                variant={formState === 1 ? "contained" : "outlined"}
                onClick={() => setFormState(1)}
              >
                Sign Up
              </Button>
            </Box>

            <Box sx={{ mt: 3 }}>
              {formState === 1 && (
                <TextField
                  fullWidth
                  label="Full Name"
                  margin="normal"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />
              )}

              <TextField
                fullWidth
                label="Username"
                margin="normal"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
              />

              <TextField
                fullWidth
                type="password"
                label="Password"
                margin="normal"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              {error && (
                <Typography
                  color="error"
                  sx={{ mt: 1 }}
                >
                  {error}
                </Typography>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3 }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </ThemeProvider>
  );
}
