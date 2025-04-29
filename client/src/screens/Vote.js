import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

import Snackbar from "@mui/material/Snackbar"; // 🆕 added
import MuiAlert from "@mui/material/Alert";     // 🆕 added

import Candidate from "../components/CandidateCard";

export default function Vote({ role, contract, web3, currentAccount }) {
  const [candidates, setCandidates] = useState([]);
  const [vote, setVote] = useState(null);
  const [electionState, setElectionState] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  // Snackbar states 🆕
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");

  const getCandidates = async () => {
    if (contract) {
      const count = await contract.methods.candidatesCount().call();
      const temp = [];
      for (let i = 1; i <= count; i++) {
        const candidate = await contract.methods.candidates(i).call();
        temp.push({ name: candidate.name, votes: candidate.voteCount });
      }
      setCandidates(temp);
    }
  };

  const voteCandidate = async (candidate) => {
    try {
      if (contract) {
        await contract.methods.vote(candidate).send({ from: currentAccount });
        getCandidates();
        // Success snackbar 🆕
        setSnackMessage("✅ Vote submitted successfully!");
        setSnackSeverity("success");
        setSnackOpen(true);
      }
    } catch (error) {
      console.error("Error:", error);
      // Error snackbar 🆕
      setSnackMessage("❌ Vote failed! " + error.message);
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  const getElectionState = async () => {
    if (contract) {
      const state = await contract.methods.electionState().call();
      setElectionState(parseInt(state));
    }
  };

  const getRemainingTime = async () => {
    if (contract) {
      const time = await contract.methods.getRemainingTime().call();
      setRemainingTime(parseInt(time));
    }
  };

  useEffect(() => {
    getElectionState();
    getCandidates();
    getRemainingTime();

    const timer = setInterval(() => {
      getRemainingTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [contract]);

  const handleVoteChange = (event) => {
    setVote(event.target.value);
  };

  const handleVote = (event) => {
    event.preventDefault();
    voteCandidate(vote);
  };

  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  return (
    <Box>
      <form onSubmit={handleVote}>
        <Grid container sx={{ mt: 0 }} spacing={6} justifyContent="center">
          <Grid item xs={12}>
            <Typography align="center" variant="h6">
              {electionState === 0 &&
                "Please Wait... Election has not started yet."}
              {electionState === 1 && "VOTE FOR YOUR FAVOURITE CANDIDATE"}
              {electionState === 2 &&
                "Election has ended. See the results below."}
            </Typography>
            <Divider />
          </Grid>

          {electionState === 1 && remainingTime > 0 && (
            <Grid item xs={12}>
              <Typography align="center" variant="subtitle1">
                🕒 Time left to vote: {Math.floor(remainingTime / 60)}m{" "}
                {remainingTime % 60}s
              </Typography>
            </Grid>
          )}

          {electionState === 1 && remainingTime === 0 && (
            <Grid item xs={12}>
              <Typography align="center" variant="subtitle1" color="red">
                ❌ Voting period has ended!
              </Typography>
            </Grid>
          )}

          {electionState === 1 && remainingTime > 0 && (
            <>
              <Grid item xs={12}>
                <FormControl>
                  <RadioGroup
                    row
                    sx={{
                      overflowY: "hidden",
                      overflowX: "auto",
                      display: "flex",
                      width: "98vw",
                      justifyContent: "center",
                    }}
                    value={vote}
                    onChange={handleVoteChange}
                  >
                    {candidates.map((candidate, index) => (
                      <FormControlLabel
                        key={index}
                        labelPlacement="top"
                        control={<Radio />}
                        value={index + 1}
                        label={<Candidate id={index} name={candidate.name} />}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <div style={{ margin: 20 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ width: "100%" }}
                    disabled={remainingTime === 0}
                  >
                    Vote
                  </Button>
                </div>
              </Grid>
            </>
          )}

          {electionState === 2 && (
            <Grid
              item
              xs={12}
              sx={{
                overflowY: "hidden",
                overflowX: "auto",
                display: "flex",
                width: "98vw",
                justifyContent: "center",
              }}
            >
              {candidates &&
                candidates.map((candidate, index) => (
                  <Box sx={{ mx: 2 }} key={index}>
                    <Candidate
                      id={index}
                      name={candidate.name}
                      voteCount={candidate.votes}
                    />
                  </Box>
                ))}
            </Grid>
          )}
        </Grid>
      </form>

      {/* Snackbar Popup */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackClose}
          severity={snackSeverity}
          sx={{ width: "100%" }}
        >
          {snackMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
