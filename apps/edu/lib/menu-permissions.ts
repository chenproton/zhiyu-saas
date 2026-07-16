export interface MenuTreeItem {
  id: string
  label: string
  href?: string
  children?: MenuTreeItem[]
}

export function buildMenuTree(): MenuTreeItem[] {
  return [
    {
      id: "org-user",
      label: "用户管理",
      children: [
        { id: "teachers", label: "教师管理", href: "/portal/apps/system/org-user/teachers" },
        { id: "students", label: "学生管理", href: "/portal/apps/system/org-user/students" },
        { id: "roles", label: "角色管理", href: "/portal/apps/system/org-user/roles" },
        { id: "graduates", label: "毕业生管理", href: "/portal/apps/system/org-user/graduates" },
      ],
    },
    {
      id: "organization",
      label: "组织管理",
      children: [
        { id: "org-types", label: "机构类型", href: "/portal/apps/system/org-user/org-types" },
        { id: "fields", label: "字段管理", href: "/portal/apps/system/org-user/fields" },
        { id: "relations", label: "关系管理", href: "/portal/apps/system/org-user/relations" },
      ],
    },
    {
      id: "resource",
      label: "资源配置",
      children: [
        { id: "majors", label: "专业设置", href: "/portal/apps/system/resource/majors" },
        { id: "package", label: "套餐管理", href: "/portal/apps/system/resource/package" },
      ],
    },
    {
      id: "tenant",
      label: "租户管理",
      children: [
        { id: "tenant-config", label: "租户配置", href: "/portal/apps/system/tenant" },
      ],
    },
  ]
}
