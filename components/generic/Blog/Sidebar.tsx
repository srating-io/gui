'use client';

import Link from 'next/link';

import { Dates } from '@esmalley/ts-utils';
import { MenuItem, MenuList, Typography, useTheme } from '@esmalley/react-material-ui';


/**
 * The post list. Rendered as-is by both the desktop rail and the mobile drawer
 * so the two never drift apart.
 */
const Sidebar = (
  {
    sidebarPosts,
    activeId,
    onNavigate,
  }:
  {
    sidebarPosts;
    activeId?: string;
    onNavigate?: () => void;
  },
) => {
  const theme = useTheme();

  return (
    <MenuList style = {{ padding: 0 }}>
      {sidebarPosts.map((post) => {
        const active = (post.id === activeId);

        return (
          <MenuItem
            key = {post.id}
            // MenuItem's own `active` paints a background block. The selected post
            // is shown with blue text instead, so only the hover state is left.
            style = {{ padding: 0, minHeight: 0, borderRadius: 6 }}
          >
            <Link
              href = {`/blog/${post.id}`}
              onClick = {onNavigate}
              style = {{ display: 'block', width: '100%', minWidth: 0, padding: '6px 10px', textDecoration: 'none' }}
            >
              <Typography
                type = 'body2'
                style = {{
                  color: (active ? theme.link.primary : 'inherit'),
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {post.metadata.title}
              </Typography>
              <Typography type = 'caption' style = {{ display: 'block', fontSize: 11, lineHeight: 1.3, color: theme.text.secondary }}>
                {Dates.format(Dates.parse(post.metadata.date), "M j 'y")}
              </Typography>
            </Link>
          </MenuItem>
        );
      })}
    </MenuList>
  );
};

export default Sidebar;
