import { useRef, useState, useMemo, useEffect } from "react";
import { Dialog, Toolbar, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { Text, Button, LinearProgress, Pill } from "../../components";
import { DiffEditor } from "@monaco-editor/react";
import { makeStyles } from "@material-ui/styles";
import { useSaveSchedule, useScheduleNames } from "../../data/schedule";
import _ from "lodash";

const useStyles = makeStyles({
  rightButtons: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "flex-end",
    gap: 8,
  },
  toolbar: {
    paddingLeft: 20,
  },
});
//const WORKFLOW_SAVED_SUCCESSFULLY = "Workflow saved successfully.";
const SCHEDULE_SAVE_FAILED = "Failed to save the schedule definition.";

export default function SaveScheduleDialog({ onSuccess, onCancel, document }) {
  const classes = useStyles();
  const diffMonacoRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState();
  const scheduleNames = useScheduleNames();

  const modified = useMemo(() => {
    if (!scheduleNames || !document) return { text: "" };

    const parsedModified = JSON.parse(document.modified);
    const modifiedName = parsedModified.wfName;
    const isNew = _.get(document, "originalObj.wfName") !== modifiedName;

    return {
      text: document.modified,
      obj: parsedModified,
      isNew: isNew,
      isClash: isNew && scheduleNames.includes(modifiedName),
    };
  }, [document, scheduleNames]);

  const { isLoading, mutate: saveSchedule } = useSaveSchedule({
    onSuccess: (data) => {
      console.log("onsuccess", data);
      onSuccess(modified.obj.wfName || document.modified?.wfName);
    },
    onError: (err) => {
      console.log("onerror", err);
      let errStr = _.isString(err.body)
        ? err.body
        : JSON.stringify(err.body, null, 2);
      setErrorMsg({
        message: `${SCHEDULE_SAVE_FAILED}: ${errStr}`,
        dismissible: true,
      });
    },
  });

  useEffect(() => {
    if (modified.isClash) {
      setErrorMsg({
        message: "Cannot save Schedule definition. Schedule name already in use.",
        dismissible: false,
      });
    } else {
      setErrorMsg(undefined);
    }
  }, [modified]);

  const handleSave = () => {
    saveSchedule({ body: modified.obj, isNew: modified.isNew });
  };

  const diffEditorDidMount = (editor) => {
    diffMonacoRef.current = editor;
  };

  return (
    <Dialog fullScreen open={!!document} onClose={() => onCancel()}>
      <Snackbar
        open={!!errorMsg}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transitionDuration={{ exit: 0 }}
      >
        <Alert
          severity="error"
          onClose={_.get(errorMsg, "dismissible") ? () => setErrorMsg() : null}
        >
          {_.get(errorMsg, "message")}
        </Alert>
      </Snackbar>

      {isLoading && <LinearProgress />}

      <Toolbar className={classes.toolbar}>
        <Text>
          Saving{" "}
          <span style={{ fontWeight: "bold" }}>
            {_.get(modified, "obj.wfName")}
          </span>
        </Text>

        {modified.isNew && <Pill label="New" color="yellow" />}

        <div className={classes.rightButtons}>
          <Button onClick={handleSave} disabled={modified.isClash}>
            Save
          </Button>
          <Button onClick={() => onCancel()} variant="secondary">
            Cancel
          </Button>
        </div>
      </Toolbar>

      {document && (
        <DiffEditor
          height={"100%"}
          width={"100%"}
          theme="vs-light"
          language="json"
          original={document.original}
          modified={document.modified}
          autoIndent={true}
          onMount={diffEditorDidMount}
          options={{
            selectOnLineNumbers: true,
            readOnly: true,
            minimap: {
              enabled: false,
            },
          }}
        />
      )}
    </Dialog>
  );
}
