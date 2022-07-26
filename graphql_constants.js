const { request, gql } = require('graphql-request')




exports.GET_PROFILE = gql`query UserByPublicKey($publicKey: String!) {
        user: user_by_pk(publicKey: $publicKey) {
          ...UserFragment
        }
      }

          fragment UserFragment on user {
        userIndex
        publicKey
        username
        profileImageUrl
        coverImageUrl
        name
        bio
        moderationStatus
        joinedWaitlistAt
        createdAt
        isApprovedForMigrationAt
        isAdmin
        links
      }`

