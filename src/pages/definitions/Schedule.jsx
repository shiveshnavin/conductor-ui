import React, { useState } from "react";
import { NavLink, DataTable, Button } from "../../components";
import { makeStyles } from "@material-ui/styles";
import Header from "./Header";
import sharedStyles from "../styles";
import { Helmet } from "react-helmet";
import AddIcon from "@material-ui/icons/Add";
import { useSaveSchedule, useScheduleDefs } from "../../data/schedule";
import { useAppContext } from "../../export";
const useStyles = makeStyles(sharedStyles);

export default function ScheduleDefinitions() {
  const classes = useStyles();
  const { data: tasks, isFetching } = useScheduleDefs();
  const { fetchWithContext } = useAppContext();
  const [loading, isLoading] = useState(false)
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
    {
      name: "status",
      renderer: (status, body) => {

        let newStatus = status;
        if (status == 'RUN') {
          newStatus = 'SHUTDOWN'
        } else {
          newStatus = 'RUN'
        }
        return (
          <a style={{
            cursor: 'pointer'
          }} class="MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary" onClick={() => {

            isLoading(true)
            const path = "/scheduling/metadata/scheduleWf";
            fetchWithContext(path + '/' + body.wfName + "?status=" + newStatus, {
              method: "put",
            }).then((res) => {
              window.location.reload()
            }).catch(err => {
              alert(err.message)
            })

          }}>{status}</a>
        )
      },
    }
    ,
    { name: "cronExpression" },
    { name: "wfInput", type: "json", sortable: false },
  ];

  return (
    <div className={classes.wrapper}>
      <Helmet>
        <title>Conductor UI - Schedule Definitions</title>
      </Helmet>

      <Header tabIndex={3} loading={isFetching || loading} />

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
