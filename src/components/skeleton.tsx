"use client"

import { motion } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const ProductsSkeletonLoading = () => {
  // Criar um array com 5 itens para representar 5 linhas de skeleton
  const skeletonRows = Array.from({ length: 5 }, (_, i) => i)
  
  return (
    <div className="w-full rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            </TableHead>
            <TableHead>
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </TableHead>
            <TableHead>
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </TableHead>
            <TableHead>
              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
            </TableHead>
            <TableHead className="text-right">
              <div className="h-4 w-16 bg-muted rounded animate-pulse ml-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {skeletonRows.map((index) => (
            <TableRow key={index}>
              <TableCell>
                <motion.div 
                  className="h-6 w-16 bg-muted rounded"
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 1.5,
                    delay: index * 0.1
                  }}
                />
              </TableCell>
              <TableCell>
                <motion.div 
                  className="h-6 w-40 bg-muted rounded"
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 1.5,
                    delay: index * 0.1 + 0.1
                  }}
                />
              </TableCell>
              <TableCell>
                <motion.div 
                  className="h-6 w-20 bg-muted rounded"
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 1.5,
                    delay: index * 0.1 + 0.2
                  }}
                />
              </TableCell>
              <TableCell>
                <motion.div 
                  className="h-6 w-24 bg-muted rounded"
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 1.5,
                    delay: index * 0.1 + 0.3
                  }}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <motion.div 
                    className="h-8 w-8 bg-muted rounded"
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "reverse", 
                      duration: 1.5,
                      delay: index * 0.1 + 0.4
                    }}
                  />
                  <motion.div 
                    className="h-8 w-8 bg-muted rounded"
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "reverse", 
                      duration: 1.5,
                      delay: index * 0.1 + 0.5
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
