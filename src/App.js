import { useState, useRef, useEffect } from "react";
import "./App.scss";
import TimerLengthControl from "./components/timerLengthControl";

const Timer = () => {
  const [brkLength, setBrkLength] = useState(5);
  const [seshLength, setSeshLength] = useState(25);
  const [timerState, setTimerState] = useState("stopped");
  const [timerType, setTimerType] = useState("Session");
  const [timer, setTimer] = useState(1500);
  const [intervalID, setIntervalID] = useState(null);
  const [alarmColor, setAlarmColor] = useState({ color: "white" });

  const audioBeep = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalID) {
        intervalID.cancel();
      }
    };
  }, [intervalID]);

  useEffect(() => {
    warning(timer);
    buzzer(timer);
    if (timer < 0) {
      if (intervalID) {
        intervalID.cancel();
      }
  
      if (timerType === "Session") {
        beginCountDown();
        switchTimer(brkLength * 60, "Break");
      } else {
        beginCountDown();
        switchTimer(seshLength * 60, "Session");
      }
    }
  }, [timer]);

  const beginCountDown = () => {
    setIntervalID(
      accurateInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000)
    );
  };
  
  const accurateInterval = (fn, time) => {
    let cancel, timeout;
  
    const recursiveFn = async () => {
      await fn();
      timeout = setTimeout(recursiveFn, time);
    };
  
    timeout = setTimeout(recursiveFn, time);
    cancel = () => clearTimeout(timeout);
  
    return { cancel };
  };

  const warning = (_timer) => {
    if (_timer < 61 && timerState !== "stopped") {
      setAlarmColor({ color: "#a50d0d" });
    } else {
      setAlarmColor({ color: "white" });
    }
  };

  const buzzer = (_timer) => {
    if (_timer === 0) {
      audioBeep.current.play();
    }
  };

  const switchTimer = (num, str) => {
    setTimer(num);
    setTimerType(str);
    setAlarmColor({ color: "white" });
  };

  const clockify = () => {
    if (timer < 0) return "00:00";
    let minutes = Math.floor(timer / 60);
    let seconds = timer - minutes * 60;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return minutes + ":" + seconds;
  };

  const reset = () => {
    setBrkLength(5);
    setSeshLength(25);
    setTimerState("stopped");
    setTimerType("Session");
    setTimer(1500);
    setAlarmColor({ color: "white" });
    if (intervalID) {
      intervalID.cancel();
    }
    audioBeep.current.pause();
    audioBeep.current.currentTime = 0;
  };

  const setBrkLengthHandler = (e) => {
    lengthControl("brkLength", e.currentTarget.value, brkLength, "Session");
  };

  const setSeshLengthHandler = (e) => {
    lengthControl("seshLength", e.currentTarget.value, seshLength, "Break");
  };

  const lengthControl = (stateToChange, sign, currentLength, timerTypeValid) => {
    if (timerState === "running") {
      return;
    }

    if (timerType === timerTypeValid) {
      if (sign === "-" && currentLength !== 1) {
        stateToChange === "brkLength"
          ? setBrkLength(currentLength - 1)
          : setSeshLength(currentLength - 1);
      } else if (sign === "+" && currentLength !== 60) {
        stateToChange === "brkLength"
          ? setBrkLength(currentLength + 1)
          : setSeshLength(currentLength + 1);
      }
    } else {
      if (sign === "-" && currentLength !== 1) {
        stateToChange === "brkLength"
          ? setBrkLength(currentLength - 1)
          : setSeshLength(currentLength - 1);
        setTimer((currentLength - 1) * 60);
      } else if (sign === "+" && currentLength !== 60) {
        stateToChange === "brkLength"
          ? setBrkLength(currentLength + 1)
          : setSeshLength(currentLength + 1);
        setTimer((currentLength + 1) * 60);
      }
    }
  };

  const timerControl = () => {
    if (timerState === "stopped") {
      beginCountDown();
      setTimerState("running");
    } else {
      setTimerState("stopped");
      if (intervalID) {
        intervalID.cancel();
      }
    }
  };

  return (
    <div id="container">
      <div>
        <div className="main-title">25 + 5 Clock</div>
        <TimerLengthControl
          addID="break-increment"
          length={brkLength}
          lengthID="break-length"
          minID="break-decrement"
          onClick={setBrkLengthHandler}
          title="Break Length"
          titleID="break-label"
        />
        <TimerLengthControl
          addID="session-increment"
          length={seshLength}
          lengthID="session-length"
          minID="session-decrement"
          onClick={setSeshLengthHandler}
          title="Session Length"
          titleID="session-label"
        />
        <div className="timer" style={alarmColor}>
          <div className="timer-wrapper">
            <div id="timer-label">{timerType}</div>
            <div id="time-left">{clockify()}</div>
          </div>
        </div>
        <div className="timer-control">
          <button id="start_stop" onClick={timerControl}>
            <i className="fa fa-play fa-2x" />
            <i className="fa fa-pause fa-2x" />
          </button>
          <button id="reset" onClick={reset}>
            <i className="fa fa-refresh fa-2x" />
          </button>
        </div>
        <audio
          id="beep"
          preload="auto"
          ref={audioBeep}
          src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
        />
      </div>
    </div>
  );
};

export default Timer;
