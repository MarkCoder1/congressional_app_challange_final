"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";
import { HierarchyData, HierarchyNode } from "@/types/visuals";

function TreeNode({ node, level = 0 }: { node: HierarchyNode; level?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-accent/10 cursor-pointer transition-all"
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          <span className="text-accent">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        ) : (
          <div className="w-4" />
        )}
        {hasChildren ? <Folder size={16} className="text-accent" /> : <File size={16} className="text-muted-foreground" />}
        <span className="text-sm font-medium">{node.label}</span>
        <span className="text-xs text-muted-foreground">{node.description}</span>
      </div>

      <AnimatePresence initial={false}>
        {expanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-6 border-l-2 border-border pl-3"
          >
            {node.children!.map((child) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Hierarchy({ data }: { data: HierarchyData }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
        {data.title}
      </h3>
      <TreeNode node={data.root} />
    </div>
  );
}