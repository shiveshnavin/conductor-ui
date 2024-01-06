import _ from "lodash";
import { useMemo } from "react";
import { useQuery, useQueries, useMutation } from "react-query";
import qs from "qs";
import useAppContext from "../hooks/useAppContext";
import { useFetch } from "./common";
import Path from "../utils/path";

const STALE_TIME_SEARCH = 60000; // 1 min

export function useSchedule(taskName, defaultTask) {
  let path;
  if (taskName) {
    path = `/scheduling/metadata/scheduleWf/${taskName}`;
  }
  return useFetch(["scheduleDef", taskName], path, {}, defaultTask);
}

export function useScheduleNames() {
  const { data } = useScheduleDefs();
  return useMemo(
    () => (data ? Array.from(new Set(data.map((def) => def.name))).sort() : []),
    [data]
  );
}

export function useScheduleDefs() {
  return useFetch(["scheduleDefs"], "/scheduling/metadata/scheduleWf");
}

export function useSaveSchedule(callbacks) {
  const path = "/scheduling/metadata/scheduleWf";
  const { fetchWithContext } = useAppContext();

  return useMutation(({ body, isNew }) => {
    return fetchWithContext(path + (isNew ? '' : '/' + body.wfName + "?status=" + body.status), {
      method: isNew ? "post" : "put",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(isNew ? body : body), // Note: application of [] is opposite of workflow
    });
  }, callbacks);
}


















export function useTaskSearch({ searchReady, ...searchObj }) {
  const { fetchWithContext, ready, stack } = useAppContext();

  const pathRoot = "/tasks/search?";
  const { rowsPerPage, page, sort, freeText, query } = searchObj;

  const isEmptySearch = _.isEmpty(query) && freeText === "*";

  return useQuery(
    [stack, pathRoot, searchObj],
    () => {
      if (isEmptySearch) {
        return {
          results: [],
          totalHits: 0,
        };
      } else {
        const path =
          pathRoot +
          qs.stringify({
            start: (page - 1) * rowsPerPage,
            size: rowsPerPage,
            sort: sort,
            freeText: freeText,
            query: query,
          });
        return fetchWithContext(path);
      }
      // staletime to ensure stable view when paginating back and forth (even if underlying results change)
    },
    {
      enabled: ready,
      keepPreviousData: true,
      staleTime: STALE_TIME_SEARCH,
    }
  );
}

export function usePollData(taskName) {
  const { fetchWithContext, ready, stack } = useAppContext();

  const pollDataPath = `/tasks/queue/polldata?taskType=${taskName}`;

  return useQuery([stack, pollDataPath], () => fetchWithContext(pollDataPath), {
    enabled: ready && !_.isEmpty(taskName),
  });
}

export function useQueueSize(taskName, domain) {
  const { fetchWithContext, ready, stack } = useAppContext();

  const path = new Path("/tasks/queue/size");
  path.search.append("taskType", taskName);

  if (!_.isUndefined(domain)) {
    path.search.append("domain", domain);
  }

  return useQuery([stack, "queueSize", taskName, domain], () =>
    fetchWithContext(path.toString(), {
      enabled: ready,
    })
  );
}

export function useQueueSizes(taskName, domains) {
  const { fetchWithContext, ready, stack } = useAppContext();

  return useQueries(
    domains
      ? domains.map((domain) => {
        const path = new Path("/tasks/queue/size");
        path.search.append("taskType", taskName);

        if (!_.isUndefined(domain)) {
          path.search.append("domain", domain);
        }

        return {
          queryKey: [stack, "queueSize", taskName, domain],
          queryFn: async () => {
            const result = await fetchWithContext(path.toString());
            return {
              domain: domain,
              size: result,
            };
          },
          enabled: ready && !!domains,
        };
      })
      : []
  );
}


export function useTaskDefs() {
  return useFetch(["taskDefs"], "/metadata/taskdefs");
}
