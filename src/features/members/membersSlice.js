import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/apiService';

// Async thunks
export const getMembers = createAsyncThunk(
  'members/getMembers',
  async (params, thunkAPI) => {
    try {
      const response = await apiService.users.getAll(params);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const getMember = createAsyncThunk(
  'members/getMember',
  async (id, thunkAPI) => {
    try {
      const response = await apiService.users.getById(id);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const createMember = createAsyncThunk(
  'members/createMember',
  async (memberData, thunkAPI) => {
    try {
      const response = await apiService.users.create(memberData);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const updateMember = createAsyncThunk(
  'members/updateMember',
  async ({ id, memberData }, thunkAPI) => {
    try {
      const response = await apiService.users.update(id, memberData);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const deleteMember = createAsyncThunk(
  'members/deleteMember',
  async (id, thunkAPI) => {
    try {
      await apiService.users.delete(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const updateMemberQualification = createAsyncThunk(
  'members/updateQualification',
  async ({ id, qualification }, thunkAPI) => {
    try {
      const response = await apiService.users.updateQualification(id, qualification);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const resetMemberPassword = createAsyncThunk(
  'members/resetPassword',
  async (id, thunkAPI) => {
    try {
      const response = await apiService.users.resetPassword(id);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

const initialState = {
  members: [],
  currentMember: null,
  isLoading: false,
  error: null,
  totalMembers: 0,
  page: 1,
  limit: 10
};

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Members
      .addCase(getMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = action.payload.data;
        state.totalMembers = action.payload.count || action.payload.data.length;
      })
      .addCase(getMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Une erreur est survenue';
      })
      // Get Single Member
      .addCase(getMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMember = action.payload.data;
      })
      .addCase(getMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Une erreur est survenue';
      })
      // Create Member
      .addCase(createMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members.unshift(action.payload.data);
        state.totalMembers += 1;
      })
      .addCase(createMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Une erreur est survenue';
      })
      // Update Member
      .addCase(updateMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.members.findIndex(
          (member) => member._id === action.payload.data._id
        );
        if (index !== -1) {
          state.members[index] = action.payload.data;
        }
        state.currentMember = action.payload.data;
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Une erreur est survenue';
      })
      // Delete Member
      .addCase(deleteMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = state.members.filter(
          (member) => member._id !== action.payload
        );
        state.totalMembers -= 1;
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Une erreur est survenue';
      })
      // Update Qualification
      .addCase(updateMemberQualification.fulfilled, (state, action) => {
        const index = state.members.findIndex(
          (member) => member._id === action.payload.data._id
        );
        if (index !== -1) {
          state.members[index] = action.payload.data;
        }
      })
      // Reset Password
      .addCase(resetMemberPassword.fulfilled, (state) => {
        // Pas de changement d'état nécessaire pour le reset de mot de passe
      });
  }
});

export const { setPage, setLimit, clearError } = membersSlice.actions;
export default membersSlice.reducer;
