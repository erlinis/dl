import { components } from '@octokit/openapi-types'
import { Endpoints } from '@octokit/types'
import { Octokit } from 'octokit'

export type Repository = Endpoints['GET /repos/{owner}/{repo}']['response']['data']
export type Frameworks = 'rails' | 'sinatra'
export type Platforms = 'ruby' | 'go'

export type Technologies = Frameworks | Platforms
export type ContentFile = components['schemas']['content-file']

export interface Project extends Metadata {
  name: string
  description: string
  url: string
  defaultBranch: string
  language: string
  dependabotPRs: number
}

export interface OfficialVersions {
  rails: VersionsDetails
  sinatra: VersionsDetails
  ruby: VersionsDetails
  go: VersionsDetails
}

export interface VersionsDetails {
  latest: string
  stables: string[]
}

export interface MetadataStrategy {
  octokitClient: Octokit
  getMetadata(repository: Repository): Promise<Metadata>
}

interface MetadataAttributes {
  name: string
  version: string
  status: string
}

export interface Metadata {
  framework: MetadataAttributes | {}
  platform: MetadataAttributes | {}
}
