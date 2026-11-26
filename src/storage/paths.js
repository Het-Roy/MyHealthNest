import { Paths, Directory } from 'expo-file-system';

let baseDocDir = null;

export function getDocumentDirectory() {
  if (!baseDocDir) {
    try {
      baseDocDir = Paths.document;
    } catch {
      baseDocDir = new Directory('file:///data/user/0/myhealthnest/files');
    }
  }
  return baseDocDir;
}

export function getDataDirectory() {
  return new Directory(getDocumentDirectory(), 'data');
}

export function getRecordsDirectory() {
  return new Directory(getDocumentDirectory(), 'records');
}

export function getExportsDirectory() {
  return new Directory(getDocumentDirectory(), 'exports');
}

export function getRecordDirectory(recordId) {
  return new Directory(getRecordsDirectory(), recordId);
}
