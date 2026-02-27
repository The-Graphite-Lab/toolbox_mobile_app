<<<<<<< Current (Your changes)
=======
import { fetchAuthSession } from 'aws-amplify/auth'
import { generateClient, post } from 'aws-amplify/api'
import { Amplify } from 'aws-amplify'
import awsExports from '@/src/aws-exports'

const CONNECTIONS_API_NAME = 'Connections'
let isAmplifyConfiguredForRideAlongs = false

const ensureAmplifyConfigured = () => {
  if (isAmplifyConfiguredForRideAlongs) {
    return
  }
  Amplify.configure({
    ...awsExports,
  })
  isAmplifyConfiguredForRideAlongs = true
}

const getGraphqlClient = () => {
  ensureAmplifyConfigured()
  return generateClient()
}

const GET_RIDE_ALONG_QUERY = /* GraphQL */ `
  query GetRideAlong($id: ID!) {
    getRideAlongs(id: $id) {
      id
      name
      address
      location
      status
      startedAt
      endedAt
      ClientID
      UserID
      createdAt
      updatedAt
      _version
      _lastChangedAt
    }
  }
`

const UPDATE_RIDE_ALONG_MUTATION = /* GraphQL */ `
  mutation UpdateRideAlong($input: UpdateRideAlongsInput!) {
    updateRideAlongs(input: $input) {
      id
      name
      status
      startedAt
      endedAt
      ClientID
      UserID
      updatedAt
      _version
      _lastChangedAt
    }
  }
`

const RIDE_ALONGS_BY_USER_QUERY = /* GraphQL */ `
  query RideAlongsByUser($UserID: ID!, $sortDirection: ModelSortDirection, $limit: Int, $nextToken: String) {
    rideAlongsByUserID(UserID: $UserID, sortDirection: $sortDirection, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        address
        location
        status
        startedAt
        endedAt
        ClientID
        UserID
        createdAt
        updatedAt
        _version
        _lastChangedAt
      }
      nextToken
    }
  }
`

const RIDE_ALONG_SESSIONS_BY_RIDE_ALONG_QUERY = /* GraphQL */ `
  query RideAlongSessionsByRideAlong($RideAlongID: ID!, $sortDirection: ModelSortDirection, $limit: Int, $nextToken: String) {
    rideAlongSessionsByRideAlongID(RideAlongID: $RideAlongID, sortDirection: $sortDirection, limit: $limit, nextToken: $nextToken) {
      items {
        id
        RideAlongID
        ClientID
        UserID
        sessionStartTime
        sessionEndTime
        sessionTerminationReason
        assemblySessionId
        recordingDurationSeconds
        createdAt
        updatedAt
        _version
        _lastChangedAt
      }
      nextToken
    }
  }
`

const RIDE_ALONG_TURNS_BY_SESSION_QUERY = /* GraphQL */ `
  query RideAlongTurnsBySession($RideAlongSessionID: ID!, $sortDirection: ModelSortDirection, $limit: Int, $nextToken: String) {
    rideAlongSessionTurnsByRideAlongSessionID(RideAlongSessionID: $RideAlongSessionID, sortDirection: $sortDirection, limit: $limit, nextToken: $nextToken) {
      items {
        id
        RideAlongSessionID
        RideAlongID
        ClientID
        UserID
        type
        turnOrder
        turnIsFormatted
        endOfTurn
        transcript
        utterance
        languageCode
        languageConfidence
        endOfTurnConfidence
        words
        createdAt
        updatedAt
        _version
        _lastChangedAt
      }
      nextToken
    }
  }
`

export type RideAlongStatus = 'SCHEDULED' | 'LIVE' | 'PAUSED' | 'ENDED'

export type RideAlong = {
  id: string
  name: string
  address?: string | null
  location?: string | null
  status?: RideAlongStatus | null
  startedAt?: string | null
  endedAt?: string | null
  ClientID: string
  UserID: string
  createdAt?: string | null
  updatedAt?: string | null
  _version?: number | null
  _lastChangedAt?: number | null
}

export type RideAlongSession = {
  id: string
  RideAlongID: string
  ClientID: string
  UserID: string
  sessionStartTime: string
  sessionEndTime?: string | null
  sessionTerminationReason?: string | null
  assemblySessionId?: string | null
  recordingDurationSeconds?: number | null
  createdAt?: string | null
  updatedAt?: string | null
  _version?: number | null
  _lastChangedAt?: number | null
}

export type RideAlongSessionTurn = {
  id: string
  RideAlongSessionID: string
  RideAlongID: string
  ClientID: string
  UserID: string
  type?: string | null
  turnOrder: number
  turnIsFormatted: boolean
  endOfTurn: boolean
  transcript: string
  utterance?: string | null
  languageCode?: string | null
  languageConfidence?: number | null
  endOfTurnConfidence?: number | null
  words?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  _version?: number | null
  _lastChangedAt?: number | null
}

type GraphQLResponse<T> = {
  data?: T
}

const getAuthMode = () => 'userPool' as const
const nowIso = () => new Date().toISOString()

const getConnectionsBaseUrl = () => {
  const apiEntries = (awsExports as { aws_cloud_logic_custom?: Array<{ name?: string; endpoint?: string }> }).aws_cloud_logic_custom || []
  const entry = apiEntries.find((item) => item?.name === CONNECTIONS_API_NAME)
  return entry?.endpoint || ''
}

export const getRideAlongApiBaseUrl = () => getConnectionsBaseUrl()

export const getApiAuthToken = async () => {
  ensureAmplifyConfigured()
  const session = await fetchAuthSession()
  return session.tokens?.idToken?.toString() || ''
}

const paginateItems = async <T>(
  query: string,
  variables: Record<string, unknown>,
  rootField: string
) => {
  let nextToken: string | null | undefined = null
  const items: T[] = []

  do {
    const graphqlClient = getGraphqlClient()
    const response = (await graphqlClient.graphql({
      query,
      variables: {
        ...variables,
        nextToken,
        limit: 100,
      },
      authMode: getAuthMode(),
    })) as GraphQLResponse<Record<string, { items?: T[]; nextToken?: string | null }>>

    const payload = response.data?.[rootField]
    const pageItems = payload?.items || []
    items.push(...pageItems)
    nextToken = payload?.nextToken
  } while (nextToken)

  return items
}

export const listRideAlongsByUser = async ({
  userId,
  status,
}: {
  userId: string
  status?: RideAlongStatus
}) => {
  const items = await paginateItems<RideAlong>(
    RIDE_ALONGS_BY_USER_QUERY,
    {
      UserID: userId,
      sortDirection: 'ASC',
    },
    'rideAlongsByUserID'
  )

  return items
    .filter((item) => (status ? item.status === status : true))
    .sort((a, b) => {
      const aTime = a.createdAt || ''
      const bTime = b.createdAt || ''
      return bTime.localeCompare(aTime)
    })
}

export const listScheduledRideAlongsByUser = async (userId: string) =>
  listRideAlongsByUser({ userId, status: 'SCHEDULED' })

export const getActiveRideAlongByUser = async (userId: string) => {
  const items = await listRideAlongsByUser({ userId })
  const liveRideAlong = items.find((item) => item.status === 'LIVE')
  if (liveRideAlong) {
    return liveRideAlong
  }

  const pausedRideAlong = items.find((item) => item.status === 'PAUSED')
  return pausedRideAlong || null
}

export const getRideAlongById = async (rideAlongId: string) => {
  const graphqlClient = getGraphqlClient()
  const response = (await graphqlClient.graphql({
    query: GET_RIDE_ALONG_QUERY,
    variables: { id: rideAlongId },
    authMode: getAuthMode(),
  })) as GraphQLResponse<{ getRideAlongs: RideAlong | null }>

  return response.data?.getRideAlongs || null
}

export const updateRideAlongStatus = async ({
  rideAlongId,
  status,
  startedAt,
  endedAt,
}: {
  rideAlongId: string
  status: RideAlongStatus
  startedAt?: string
  endedAt?: string
}) => {
  const existing = await getRideAlongById(rideAlongId)
  if (!existing) {
    throw new Error('Ride along not found.')
  }

  // byUserIDByStatus uses a composite sort key [status, createdAt], so
  // AppSync requires createdAt in updates whenever status changes.
  if (!existing.createdAt) {
    throw new Error(
      "Ride along is missing createdAt, which is required for the byUserIDByStatus index update."
    )
  }

  const input: Record<string, unknown> = {
    id: rideAlongId,
    status,
    createdAt: existing.createdAt,
    startedAt:
      startedAt !== undefined
        ? startedAt
        : status === 'LIVE'
          ? existing.startedAt || nowIso()
          : existing.startedAt,
    endedAt:
      endedAt !== undefined
        ? endedAt
        : status === 'ENDED'
          ? existing.endedAt || nowIso()
          : existing.endedAt,
  }

  if (existing._version !== null && existing._version !== undefined) {
    input._version = existing._version
  }

  const graphqlClient = getGraphqlClient()
  const response = (await graphqlClient.graphql({
    query: UPDATE_RIDE_ALONG_MUTATION,
    variables: {
      input,
    },
    authMode: getAuthMode(),
  })) as GraphQLResponse<{ updateRideAlongs: RideAlong }>

  return response.data?.updateRideAlongs || null
}

export const markRideAlongAsLive = async (rideAlongId: string) =>
  updateRideAlongStatus({
    rideAlongId,
    status: 'LIVE',
    startedAt: nowIso(),
  })

export const markRideAlongAsResumed = async (rideAlongId: string) =>
  updateRideAlongStatus({
    rideAlongId,
    status: 'LIVE',
  })

export const markRideAlongAsPaused = async (rideAlongId: string) =>
  updateRideAlongStatus({
    rideAlongId,
    status: 'PAUSED',
  })

export const markRideAlongAsEnded = async (rideAlongId: string) =>
  updateRideAlongStatus({
    rideAlongId,
    status: 'ENDED',
    endedAt: nowIso(),
  })

export const listRideAlongSessionsByRideAlong = async (rideAlongId: string) => {
  const items = await paginateItems<RideAlongSession>(
    RIDE_ALONG_SESSIONS_BY_RIDE_ALONG_QUERY,
    {
      RideAlongID: rideAlongId,
      sortDirection: 'DESC',
    },
    'rideAlongSessionsByRideAlongID'
  )

  return items.sort((a, b) =>
    (b.sessionStartTime || '').localeCompare(a.sessionStartTime || '')
  )
}

export const listRideAlongTurnsBySession = async (sessionId: string) => {
  const items = await paginateItems<RideAlongSessionTurn>(
    RIDE_ALONG_TURNS_BY_SESSION_QUERY,
    {
      RideAlongSessionID: sessionId,
      sortDirection: 'ASC',
    },
    'rideAlongSessionTurnsByRideAlongSessionID'
  )

  return items.sort((a, b) => a.turnOrder - b.turnOrder)
}

const postRideAlongApi = async <T>(
  path: string,
  body: Record<string, unknown>
) => {
  ensureAmplifyConfigured()
  const response = await post({
    apiName: CONNECTIONS_API_NAME,
    path,
    options: {
      body: body as any,
    },
  }).response

  return response.body.json() as Promise<T>
}

export type AssemblyStreamingTokenResponse = {
  token: string
  expiresInSeconds: number
  wsUrl: string
  keytermsPrompt?: string[]
}

export const createAssemblyStreamingToken = async ({
  expiresInSeconds = 600,
  maxSessionDurationSeconds = 10800,
  rideAlongId,
}: {
  expiresInSeconds?: number
  maxSessionDurationSeconds?: number
  rideAlongId: string
}) =>
  postRideAlongApi<AssemblyStreamingTokenResponse>(
    '/ridealongs/assembly/token',
    {
      expiresInSeconds,
      maxSessionDurationSeconds,
      rideAlongId,
    }
  )

export const postRideAlongSessionStart = async ({
  rideAlongId,
  clientId,
  userId,
  assemblySessionId,
  startedAt,
}: {
  rideAlongId: string
  clientId: string
  userId: string
  assemblySessionId: string
  startedAt: string
}) =>
  postRideAlongApi<{
    status: string
    alreadyExists?: boolean
    session?: {
      id: string
      _version?: number | null
      sessionStartTime?: string | null
      RideAlongID?: string | null
      ClientID?: string | null
      UserID?: string | null
      assemblySessionId?: string | null
    } | null
  }>(
    '/ridealongs/sessions/start',
    {
      rideAlongId,
      clientId,
      userId,
      assemblySessionId,
      startedAt,
    }
  )

export const postRideAlongSessionTurns = async ({
  sessionId,
  rideAlongId,
  clientId,
  userId,
  turns,
}: {
  sessionId: string
  rideAlongId: string
  clientId: string
  userId: string
  turns: Array<Record<string, unknown>>
}) =>
  postRideAlongApi<{ status: string; createdCount: number }>(
    `/ridealongs/sessions/${sessionId}/turns`,
    {
      rideAlongId,
      clientId,
      userId,
      turns,
    }
  )

export const postRideAlongSessionFinish = async ({
  sessionId,
  rideAlongId,
  endedAt,
  terminationReason,
  duration,
  sessionVersion,
}: {
  sessionId: string
  rideAlongId: string
  endedAt: string
  terminationReason: string
  duration?: number
  sessionVersion?: number
}) =>
  postRideAlongApi<{ status: string }>(
    `/ridealongs/sessions/${sessionId}/finish`,
    {
      rideAlongId,
      endedAt,
      terminationReason,
      duration,
      sessionVersion,
    }
  )

export const getRideAlongRecordingUploadUrl = async ({
  sessionId,
  clientId,
  rideAlongId,
  contentType = 'audio/webm',
}: {
  sessionId: string
  clientId: string
  rideAlongId: string
  contentType?: string
}) =>
  postRideAlongApi<{
    status: string
    bucket: string
    key: string
    signedUrl: string
    turnRecordingPathTemplate: string
  }>(
    `/ridealongs/sessions/${sessionId}/recording-upload-url`,
    {
      clientId,
      rideAlongId,
      contentType,
    }
  )

export const uploadRideAlongRecordingBlob = async ({
  signedUrl,
  blob,
  contentType = 'audio/webm',
}: {
  signedUrl: string
  blob: Blob
  contentType?: string
}) => {
  const response = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: blob,
  })

  if (!response.ok) {
    throw new Error(`Failed to upload recording file. Status: ${response.status}`)
  }
}
>>>>>>> Incoming (Background Agent changes)
