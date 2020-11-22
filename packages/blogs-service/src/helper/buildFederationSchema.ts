import { addResolversToSchema, GraphQLResolverMap } from 'apollo-graphql';
import { GraphQLSchema, specifiedDirectives } from 'graphql';
import gql from 'graphql-tag';
import { BuildSchemaOptions, buildSchemaSync } from 'type-graphql';
import { createResolversMap } from 'type-graphql/dist/utils/createResolversMap';

import {
  buildFederatedSchema as buildApolloFederationSchema,
  printSchema,
} from '@apollo/federation';
import federationDirectives from '@apollo/federation/dist/directives';

export function buildFederatedSchema(
  options: Omit<BuildSchemaOptions, 'skipCheck'>,
  referenceResolvers?: GraphQLResolverMap<any>
): GraphQLSchema {
  const schema = buildSchemaSync({
    ...options,
    directives: [
      ...specifiedDirectives,
      ...federationDirectives,
      ...(options.directives || []),
    ],
    skipCheck: true,
  });
  const federatedSchema = buildApolloFederationSchema({
    typeDefs: gql(printSchema(schema)),
    resolvers: <any>createResolversMap(schema),
  });
  if (referenceResolvers) {
    addResolversToSchema(federatedSchema, referenceResolvers);
  }
  return schema;
}
