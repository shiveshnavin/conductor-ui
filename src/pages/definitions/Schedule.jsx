import React from "react";
import { NavLink, DataTable, Button } from "../../components";
import { makeStyles } from "@material-ui/styles";
import Header from "./Header";
import sharedStyles from "../styles";
import { Helmet } from "react-helmet";
import AddIcon from "@material-ui/icons/Add";
import { useScheduleDefs } from "../../data/schedule";
const useStyles = makeStyles(sharedStyles);

const columns = [
  {
    name: "wfName",
    renderer: (name) => <NavLink path={`/scheduleDef/${name}`}>{name}</NavLink>,
  },
  { name: "createTime", type: "date" },
  { name: "updateTime", type: "date" },
  { name: "createdBy" },
  { name: "updatedBy" },
  { name: "ownerApp" },
  { name: "updatedBy" },
  { name: "wfVersion" },
  { name: "status" },
  { name: "cronExpression" },
  { name: "wfInput", type: "json", sortable: false },
];

export default function ScheduleDefinitions() {
  const classes = useStyles();
  const { data: tasks, isFetching } = useScheduleDefs();

  return (
    <div className={classes.wrapper}>
      <Helmet>
        <title>Conductor UI - Schedule Definitions</title>
      </Helmet>

      <Header tabIndex={3} loading={isFetching} />

      <div className={classes.tabContent}>
        <div className={classes.buttonRow}>
          <Button component={NavLink} path="/scheduleDef" startIcon={<AddIcon />}>
            New Schedule Definition
          </Button>
        </div>

        {tasks && (
          <DataTable
            title={`${tasks.length} results`}
            localStorageKey="tasksTable"
            defaultShowColumns={[
              "ownerApp",
              "createTime",
              "wfName",
              "cronExpression",
              "status"
            ]}
            keyField="wfName"
            default
            data={tasks}
            columns={columns}
          />
        )}
      </div>
    </div>
  );
}
