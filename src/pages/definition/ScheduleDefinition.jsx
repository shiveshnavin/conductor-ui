import React, { useMemo, useRef, useState } from "react";
import { Toolbar } from "@material-ui/core";
import { useRouteMatch } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import { Helmet } from "react-helmet";
import _ from "lodash";
import { LinearProgress, Pill, Text, Button } from "../../components";
import Editor from "@monaco-editor/react";
import { configureMonaco } from "../../schema/task";
import ResetConfirmationDialog from "./ResetConfirmationDialog";
import { useTask } from "../../data/task";
import { usePushHistory } from "../../components/NavLink";
import { NEW_SCHEDULE_TEMPLATE } from "../../schema/schedule";
import { useSchedule } from "../../data/schedule";
import SaveScheduleDialog from "./SaveScheduleDialog";

const useStyles = makeStyles({
  wrapper: {
    display: "flex",
    height: "100%",
    alignItems: "stretch",
    flexDirection: "column",
  },
  name: {
    fontWeight: "bold",
  },
  rightButtons: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "flex-end",
    gap: 8,
  },
});

export default function ScheduleDefinition() {
  const classes = useStyles();
  const match = useRouteMatch();
  const navigate = usePushHistory();

  const [isModified, setIsModified] = useState(false);
  const [jsonErrors, setJsonErrors] = useState([]);
  const [resetDialog, setResetDialog] = useState(false);
  const [saveDialog, setSaveDialog] = useState(null);

  const editorRef = useRef();
  const taskName = _.get(match, "params.name");

  const {
    data: taskDef,
    isFetching,
    refetch,
  } = useSchedule(taskName, NEW_SCHEDULE_TEMPLATE);
  const taskJson = useMemo(
    () => (taskDef ? JSON.stringify(taskDef, null, 2) : ""),
    [taskDef]
  );

  // Save
  const handleOpenSave = () => {
    setSaveDialog({
      original: taskName ? taskJson : "",
      originalObj: taskName ? taskDef : null,
      modified: editorRef.current.getModel().getValue(),
    });
  };

  const handleSaveSuccess = (name) => {
    setSaveDialog(null);
    setIsModified(false);

    if (name === taskName) {
      refetch();
    } else {
      navigate(`/scheduleDef/${name}`);
    }
  };

  // Reset
  const doReset = () => {
    editorRef.current.getModel().setValue(taskJson);

    setResetDialog(false);
    setIsModified(false);
  };

  // Monaco Handlers
  const handleEditorWillMount = (monaco) => {
    configureMonaco(monaco);
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleValidate = (markers) => {
    setJsonErrors(markers);
  };

  const handleChange = (v) => {
    setIsModified(v !== taskJson);
  };

  return (
    <>
      <Helmet>
        <title>Conductor UI - Schedule Definition - {taskName || "New Task"}</title>
      </Helmet>

      <SaveScheduleDialog
        document={saveDialog}
        onCancel={() => setSaveDialog(null)}
        onSuccess={handleSaveSuccess}
      />

      <ResetConfirmationDialog
        version={resetDialog}
        onConfirm={doReset}
        onClose={() => setResetDialog(false)}
      />

      {isFetching && <LinearProgress />}
      <div className={classes.wrapper}>
        <Toolbar>
          <Text className={classes.name}>{taskName || "NEW"}</Text>
          {isModified ? (
            <Pill color="yellow" label="Modified" />
          ) : (
            <Pill label="Unmodified" />
          )}
          {!_.isEmpty(jsonErrors) && <Pill color="red" label="Validation" />}

          <div className={classes.rightButtons}>
            <Button
              disabled={!_.isEmpty(jsonErrors) || !isModified}
              onClick={handleOpenSave}
            >
              Save
            </Button>
            <Button
              disabled={!isModified}
              onClick={() => setResetDialog(true)}
              variant="secondary"
            >
              Reset
            </Button>
          </div>
        </Toolbar>
        <Text style={{ padding: 5, marginTop: -10, marginLeft: 10 }} >
          <a target="_blank" href="http://www.cronmaker.com/">Cron generator</a></Text>
        <Editor
          height="100%"
          width="100%"
          theme="vs-light"
          language="json"
          value={taskJson}
          autoIndent={true}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          onValidate={handleValidate}
          onChange={handleChange}
          options={{
            selectOnLineNumbers: true,
            minimap: {
              enabled: false,
            },
          }}
        />
      </div>
    </>
  );
}
