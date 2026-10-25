/**
 * Các enum của database (lưu dạng TEXT trong SQLite/D1).
 * File này không phụ thuộc gì nên dùng được ở cả server lẫn client component.
 */
export const Role = { ADMIN: "ADMIN", EDITOR: "EDITOR" } as const;
export type Role = (typeof Role)[keyof typeof Role];
export const ROLE_VALUES = Object.values(Role) as [Role, ...Role[]];

export const PostStatus = { DRAFT: "DRAFT", PUBLISHED: "PUBLISHED", SCHEDULED: "SCHEDULED" } as const;
export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];
export const POST_STATUS_VALUES = Object.values(PostStatus) as [PostStatus, ...PostStatus[]];

export const JobStatus = { OPEN: "OPEN", CLOSED: "CLOSED" } as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
export const JOB_STATUS_VALUES = Object.values(JobStatus) as [JobStatus, ...JobStatus[]];

export const Gender = { MALE: "MALE", FEMALE: "FEMALE", ANY: "ANY" } as const;
export type Gender = (typeof Gender)[keyof typeof Gender];
export const GENDER_VALUES = Object.values(Gender) as [Gender, ...Gender[]];

export const LeadType = { CONSULTATION: "CONSULTATION", APPLICATION: "APPLICATION", CONTACT: "CONTACT" } as const;
export type LeadType = (typeof LeadType)[keyof typeof LeadType];
export const LEAD_TYPE_VALUES = Object.values(LeadType) as [LeadType, ...LeadType[]];

export const LeadStatus = { NEW: "NEW", CONTACTED: "CONTACTED", PASSED: "PASSED", CANCELLED: "CANCELLED" } as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];
export const LEAD_STATUS_VALUES = Object.values(LeadStatus) as [LeadStatus, ...LeadStatus[]];

export const ProgramType = { STUDY_ABROAD: "STUDY_ABROAD", LANGUAGE: "LANGUAGE", VOCATIONAL: "VOCATIONAL" } as const;
export type ProgramType = (typeof ProgramType)[keyof typeof ProgramType];
export const PROGRAM_TYPE_VALUES = Object.values(ProgramType) as [ProgramType, ...ProgramType[]];
