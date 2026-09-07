export type ContextPreviewRequest = {
  workloadId: string;
  purpose: string;
  subject: string;
};

export type ContextPreviewResponse = {
  schemaVersion: string;
  contextId: string;
  dataAccessId: string;
  workloadId: string;
  purpose: string;
  subjectType: string;
  subjectRefDigest: string;
  contextDigest: string;
  fields: Array<{
    path: string;
    datasetName: string;
    fieldName: string;
    dataClass: string;
    valueDigest: string;
    unknownDataClass: boolean;
  }>;
  detection: {
    detectorVersion: string;
    findings: Array<{
      type: string;
      contextPath: string;
      startOffset: number;
      endOffset: number;
      detectorVersion: string;
      evidenceDigest: string;
    }>;
  };
};
