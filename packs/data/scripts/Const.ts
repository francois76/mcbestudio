export const frameRate = 240;
export const ui_suffix = "";
//export const ui_suffix = "_pe";

export const indexUiOptions = {
    path: 'components/index/index' + ui_suffix + '.html', options: {
        always_accepts_input: false,
        render_game_behind: true,
        absorbs_input: true,
        is_showing_menu: false,
        should_steal_mouse: false,
        force_render_below: false,
        render_only_when_topmost: false
    }
};
export const initUiOptions = {
    path: 'components/init/init.html', options: {
        always_accepts_input: false,
        render_game_behind: true,
        absorbs_input: false,
        is_showing_menu: false,
        should_steal_mouse: true,
        force_render_below: true,
        render_only_when_topmost: true
    }
}

export const blankScreenOptions = {
    path: 'components/blank/blank.html', options: {
        always_accepts_input: false,
        render_game_behind: true,
        absorbs_input: true,
        is_showing_menu: false,
        should_steal_mouse: false,
        force_render_below: false,
        render_only_when_topmost: false
    }
}

export const progressBarOptions = {
    path: 'components/progressBar/progressBar.html', options: {
        always_accepts_input: false,
        render_game_behind: true,
        absorbs_input: false,
        is_showing_menu: false,
        should_steal_mouse: true,
        force_render_below: true,
        render_only_when_topmost: true
    }
}

export const wallOffameOptions = {
    path: 'components/wallOfFame/wallOfFame.html', options: {
        always_accepts_input: false,
        render_game_behind: true,
        absorbs_input: true,
        is_showing_menu: false,
        should_steal_mouse: false,
        force_render_below: false,
        render_only_when_topmost: false
    }
}

export const confirmModalOptions = {
    path: 'components/confirmModal/confirmModal.html', options: {
        always_accepts_input: false,
        render_game_behind: true,
        absorbs_input: true,
        is_showing_menu: false,
        should_steal_mouse: false,
        force_render_below: true,
        render_only_when_topmost: false
    }
}