/**
 * RPB MCP — read-only context tools only.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { asTextContent } from "./contracts/envelope.js";
import { PROJECT_DOCS } from "./security/docs-registry.js";
import { rpbGetAgentBootstrap } from "./tools/context/get-bootstrap.js";
import { rpbListProjectDocs } from "./tools/context/list-docs.js";
import { rpbFindProjectDoc } from "./tools/context/find-doc.js";
import { rpbReadProjectDoc } from "./tools/context/read-doc.js";
import { rpbProductOverview } from "./tools/context/product-overview.js";
import { rpbArchitectureMap } from "./tools/context/architecture-map.js";
import { rpbCurrentState } from "./tools/context/current-state.js";
import {
  rpbGetGuardianReport,
  rpbGetPromptInventory,
  rpbGetRepositoryTree,
  rpbGetRouteInventory,
  rpbGetSchemaInventory,
} from "./tools/context/generated-maps.js";
import { rpbGetReferenceConcept } from "./tools/context/reference-concept.js";

const DOC_ID_HINT = Object.keys(PROJECT_DOCS).join(", ");

export function createServer() {
  const server = new McpServer({
    name: "research-prompt-builder",
    version: "0.1.0",
  });

  server.registerTool(
    "rpb_get_agent_bootstrap",
    {
      description:
        "Returns generated agent-bootstrap.json (first reads, status vocabulary, MCP tool list). Run knowledge:update if missing.",
    },
    async () => asTextContent(await rpbGetAgentBootstrap())
  );

  server.registerTool(
    "rpb_list_project_docs",
    {
      description:
        "Lists allowlisted RPB document IDs with paths. Use before rpb_read_project_doc when the id is unknown.",
    },
    async () => asTextContent(await rpbListProjectDocs())
  );

  server.registerTool(
    "rpb_find_project_doc",
    {
      description:
        "Finds allowlisted document IDs by free-text query (id, path, title).",
      inputSchema: {
        query: z.string().min(1),
        limit: z.number().int().min(1).max(20).optional(),
      },
    },
    async ({ query, limit }) =>
      asTextContent(await rpbFindProjectDoc(query, limit ?? 8))
  );

  server.registerTool(
    "rpb_read_project_doc",
    {
      description:
        "Reads an allowlisted project document by document ID only. Unknown IDs return DOCUMENT_NOT_REGISTERED. " +
        `Known ids include: ${DOC_ID_HINT}.`,
      inputSchema: {
        documentId: z.string().min(1).describe("Allowlisted document id"),
      },
    },
    async ({ documentId }) => asTextContent(await rpbReadProjectDoc(documentId))
  );

  server.registerTool(
    "rpb_product_overview",
    {
      description:
        "Parsed PRODUCT.md: governing sentence, four outcomes, non-goals sample.",
    },
    async () => asTextContent(await rpbProductOverview())
  );

  server.registerTool(
    "rpb_architecture_map",
    {
      description:
        "Parsed ARCHITECTURE.md: three planes and API surface hints.",
    },
    async () => asTextContent(await rpbArchitectureMap())
  );

  server.registerTool(
    "rpb_current_state",
    {
      description:
        "Returns CURRENT_STATE.md (Live/Partial/Planned honesty).",
    },
    async () => asTextContent(await rpbCurrentState())
  );

  server.registerTool(
    "rpb_get_repository_tree",
    {
      description:
        "Generated repository-tree.json inventory (not arbitrary FS access).",
    },
    async () => asTextContent(await rpbGetRepositoryTree())
  );

  server.registerTool(
    "rpb_get_route_inventory",
    {
      description: "Generated routes.json from src/app scan.",
    },
    async () => asTextContent(await rpbGetRouteInventory())
  );

  server.registerTool(
    "rpb_get_prompt_inventory",
    {
      description: "Generated runtime-prompts.json inventory.",
    },
    async () => asTextContent(await rpbGetPromptInventory())
  );

  server.registerTool(
    "rpb_get_schema_inventory",
    {
      description: "Generated schemas.json inventory.",
    },
    async () => asTextContent(await rpbGetSchemaInventory())
  );

  server.registerTool(
    "rpb_get_guardian_report",
    {
      description:
        "Latest guardian report (GUARDIAN.md / guardian.json). Run knowledge:guardian if missing.",
    },
    async () => asTextContent(await rpbGetGuardianReport())
  );

  server.registerTool(
    "rpb_get_reference_concept",
    {
      description:
        "Reads an allowlisted Reference concept or manifest by document ID. Authority is advisory only.",
      inputSchema: {
        conceptId: z
          .string()
          .min(1)
          .describe("e.g. refEthicalTari, referenceManifest"),
      },
    },
    async ({ conceptId }) =>
      asTextContent(await rpbGetReferenceConcept(conceptId))
  );

  return server;
}
